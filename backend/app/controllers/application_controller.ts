import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import Application from '#models/application'
import Assignment from '#models/assignment'
import Student from '#models/student'
import LogService from '#services/log_service'
import drive from '@adonisjs/drive/services/main'
import WaitlistWorkflowService from '#services/waitlisted_workflow_service'
import Room from '#models/room'
import db from '@adonisjs/lucid/services/db'
import { withPrimaryImageUrl } from '#services/image_service'

@inject()
export default class ApplicationsController {
  constructor(protected waitlistService: WaitlistWorkflowService) {}

  // ─── STUDENT: CONFIRM ASSIGNMENT (accept or reject room assignment) ───
  async confirmAssignment({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    // 1. Verify the assignment belongs to this student and is pending confirmation
    const assignment = await Assignment.findOrFail(params.id)
    if (assignment.studentNumber !== student.studentNumber) {
      return response.forbidden({ message: 'This assignment does not belong to you' })
    }
    if (assignment.confirmationStatus !== 'pending_confirmation') {
      return response.badRequest({ message: 'Assignment is not pending confirmation' })
    }

    const { action } = request.body()   // 'accept' or 'reject'

    // 2. Load the room and find the related approved application
    const room = await Room.findOrFail(assignment.roomId)

    const application = await Application.query()
      .where('studentNumber', student.studentNumber)
      .where('accommodationId', room.accommodationId)
      .where('applicationStatus', 'approved')
      .first()

    if (!application) {
      return response.badRequest({ message: 'No approved application found for this accommodation' })
    }

    const trx = await db.transaction()

    try {
      if (action === 'accept') {
        assignment.confirmationStatus = 'active'
        await assignment.useTransaction(trx).save()

        application.applicationStatus = 'confirmed'
        await application.useTransaction(trx).save()

        await trx.commit()
        return response.ok({ message: 'Assignment confirmed successfully' })

      } else if (action === 'reject') {
        // Free the room
        room.roomCurrentOccupancy -= 1
        if (room.roomCurrentOccupancy < room.roomCapacity) {
          room.roomAvailability = 'available'
        }
        await room.useTransaction(trx).save()

        // Mark assignment as rejected
        assignment.confirmationStatus = 'rejected'
        await assignment.useTransaction(trx).save()

        // Cancel the application
        application.applicationStatus = 'cancelled'
        await application.useTransaction(trx).save()

        await trx.commit()

        // 3. Automatically promote the next waitlisted student
        await this.waitlistService.processMoveOut(room.accommodationId, room)

        return response.ok({ message: 'Slot released and waitlist updated' })
      }

      return response.badRequest({ message: 'action must be "accept" or "reject"' })

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  // ─── STUDENT: SUBMIT APPLICATION ─────────────────────────────
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id) // Get student_number

    const { accommodationId, applicationRoomType, applicationStayType,
            durationOfStayDays, preferredTags } = request.all()

    // Conflict Prevention: Does the student already have an active stay?
    const activeStay = await Assignment.query()
      .where('studentNumber', student.studentNumber)
      .whereNull('actualMoveOut')
      .first()

    if (activeStay) {
      return response.conflict({ message: 'You already have an active housing assignment.' })
    }

    // Transient applications skip the manager step and land in the landlord's queue
    // for downpayment verification. Non-transient follow the normal pending → manager flow.
    const initialStatus = applicationStayType === 'transient' ? 'under_review' : 'pending'

    // Create the application
    const newApp = await Application.create({
      accommodationId,
      studentNumber: student.studentNumber,
      applicationRoomType,
      applicationStayType,
      durationOfStayDays,
      applicationStatus: initialStatus,
      preferredTags: preferredTags ?? null,
    })

    await LogService.record(user.id, 'application', newApp.id, 'STUDENT_SUBMITTED')
    return response.ok(newApp)
  }

  // ─── STUDENT: VIEW MY APPLICATIONS (with estimated rent + images) ─
  async index({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized({ message: 'Unauthorized' })
    const student = await Student.findByOrFail('userId', user.id)

    // 1. Fetch all applications and preload all required nested relationships on 'accommodation'
    const applications = await Application.query()
      .where('studentNumber', student.studentNumber)
      .preload('accommodation', (accommodationQuery) => {
        // Preload rooms and their tags for rent calculation
        accommodationQuery.preload('rooms', (roomQuery) => {
          roomQuery.preload('tags')
        })
        // Preload images and their files for the signed URL
        accommodationQuery.preload('images', (imageQuery) => {
          imageQuery.preload('file')
        })
      })
      .orderBy('applicationDate', 'desc')

    // 2. Process applications to compute rent, attach signed URLs, and serialize
    const data = await Promise.all(
      applications.map(async (app) => {
        // --- A. Compute Estimated Rent ---
        const accommodationRooms = app.accommodation?.rooms ?? []
        const preferredTags: string[] = (app as any).preferredTags ?? []

        const matchingRooms = accommodationRooms.filter(room => {
          if (room.roomType !== app.applicationRoomType) return false
          if (room.roomStayType !== app.applicationStayType) return false
          if (preferredTags.length > 0) {
            const roomTagNames = room.tags?.map(t => t.tagDetail) ?? []
            if (!preferredTags.every(tag => roomTagNames.includes(tag))) return false
          }
          return true
        })

        const estimatedRent = matchingRooms.length > 0
          ? Math.min(...matchingRooms.map(r => r.roomRent))
          : null

        // --- B. Serialize Model to Plain JSON Object ---
        const serializedApp = app.serialize() as any

        // --- C. Attach Custom Properties ---
        serializedApp.estimatedMonthlyRent = estimatedRent

        if (app.accommodation) {
          // Resolve B2 signed URL and attach it to the serialized accommodation object
          serializedApp.accommodation = await withPrimaryImageUrl(app.accommodation)
        }

        return serializedApp
      })
    )

    // Return the fully populated and serialized array
    return data
  }

  // ─── MANAGER/LANDLORD: VIEW INCOMING ────────────────────────
  async incoming({ auth, response }: HttpContext) {
    const user = auth.user!
    if (user.role === 'manager') {
      const applications = await Application.query()
        .whereHas('accommodation', (q) => q.where('managerId', user.id))
        .whereIn('applicationStatus', ['pending', 'waitlisted'])
        .where('applicationStayType', 'non_transient')
        .preload('accommodation')
        .preload('student', (q) => q.preload('user', (u) => u.preload('phoneNumbers')))
        .orderBy('applicationDate', 'asc')
      return response.ok(applications)
    }
    if (user.role === 'landlord') {
      const applications = await Application.query()
        .whereHas('accommodation', (q) => q.where('landlordId', user.id))
        .whereIn('applicationStatus', ['under_review', 'approved', 'waitlisted', 'confirmed'])
        .preload('accommodation')
        .preload('student', (q) => q.preload('user'))
        .orderBy('applicationDate', 'asc')
      return response.ok(applications)
    }
    return response.forbidden({ message: 'access denied' })
  }

  // ─── MANAGER/LANDLORD: APPROVE OR REJECT ─────────────────────
  async updateStatus({ auth, request, params, response }: HttpContext) {
    const user = auth.user!
    const { action, rejection_reason } = request.body()

    if (!action || !['approve', 'reject'].includes(action)) {
      return response.badRequest({ message: 'action must be approve or reject' })
    }
    if (action === 'reject' && !rejection_reason) {
      return response.badRequest({ message: 'rejection_reason is required when rejecting' })
    }

    const applicationObject = await Application.query()
      .where('id', params.id)
      .preload('accommodation')
      .preload('student', (q) => q.preload('user'))
      .firstOrFail()

    if (applicationObject.accommodation.isFrozen) {
      return response.badRequest({
        status: 400,
        error: 'Bad Request',
        message: 'This accommodation is currently frozen. Applications cannot be processed.',
      })
    }

    // Manager approval
    if (user.role === 'manager') {
      if (applicationObject.accommodation.managerId !== user.id) {
        return response.forbidden({ message: 'You do not manage this accommodation.' })
      }
      if (applicationObject.applicationStatus !== 'pending') {
        return response.badRequest({ message: 'Application is not pending.' })
      }

      if (action === 'approve') {
        applicationObject.applicationStatus = 'under_review'
        applicationObject.rejectionReason = null
      } else {
        applicationObject.applicationStatus = 'rejected'
        applicationObject.rejectionReason = rejection_reason
      }
      await applicationObject.save()

      const detail = action === 'approve'
        ? `Manager approved application #${applicationObject.id} for ${applicationObject.student.user.fname} ${applicationObject.student.user.lname}`
        : `Manager rejected application #${applicationObject.id} – ${rejection_reason}`

      await LogService.record(user.id, 'application', applicationObject.id,
        action === 'approve' ? 'MANAGER_APPROVED' : 'MANAGER_REJECTED',
        detail)

      return response.ok(applicationObject)
    }

    // Landlord approval
    if (user.role === 'landlord') {
      if (applicationObject.accommodation.landlordId !== user.id) {
        return response.forbidden({ message: 'You do not manage this accommodation.' })
      }
      if (applicationObject.applicationStatus !== 'under_review') {
        return response.badRequest({ message: 'Application is not under review.' })
      }

      if (action === 'reject') {
        applicationObject.applicationStatus = 'rejected'
        applicationObject.rejectionReason = rejection_reason
        await applicationObject.save()
        await LogService.record(user.id, 'application', applicationObject.id, 'LANDLORD_REJECTED')
        return response.ok(applicationObject)
      }

      // Conflict prevention: a student may have only one active stay
      const activeAssignment = await Assignment.query()
        .where('studentNumber', applicationObject.studentNumber)
        .whereNull('actualMoveOut')
        .first()
      if (activeAssignment) {
        return response.conflict({ message: 'student already has an active stay, cannot approve' })
      }

      // approve then use waitlist service, set reviewer info
      applicationObject.reviewedBy = user.id
      applicationObject.reviewedAt = DateTime.now()

      const updatedApp = await this.waitlistService.processApproval(applicationObject.id)

      if (updatedApp.applicationStatus === 'approved') {
        const now = DateTime.now()
        
        // set the exact time it was approved
        updatedApp.approvedAt = now
        
        // dynamically set deadline based on stay type
        if (updatedApp.applicationStayType === 'transient') {
          updatedApp.slotConfirmDeadline = now.plus({ hours: 3 })
        } else {
          updatedApp.slotConfirmDeadline = now.plus({ days: 7 })
        }
        
        await updatedApp.save()
      }

      const detail = action === 'approve'
        ? `Landlord approved application #${applicationObject.id} for ${applicationObject.student.user.fname} ${applicationObject.student.user.lname}`
        : `Landlord rejected application #${applicationObject.id} – ${rejection_reason}`

      await LogService.record(user.id, 'application', applicationObject.id,
        updatedApp.applicationStatus === 'waitlisted' ? 'LANDLORD_WAITLISTED' :
        updatedApp.applicationStatus === 'rejected' ? 'LANDLORD_REJECTED' :
        'LANDLORD_APPROVED',
        detail)

      return response.ok(updatedApp)
    }

    return response.forbidden()
  }

  // ─── STUDENT: CANCEL APPLICATION ──────────────────────────────
  async cancel({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)
    const app = await Application.query()
      .where('id', params.id)
      .where('studentNumber', student.studentNumber)
      .firstOrFail()

    if (!['pending', 'waitlisted'].includes(app.applicationStatus)) {
      return response.badRequest({ message: 'Can only cancel pending or waitlisted applications' })
    }
    app.applicationStatus = 'cancelled'
    await app.save()
    await LogService.record(user.id, 'application', app.id, 'STUDENT_CANCELLED')
    return response.ok(app)
  }

  // ─── MANAGER: GET APPROVED APPLICATIONS FOR DASHBOARD ─────────
  async approvedForAssignment({ auth, response }: HttpContext) {
    const user = auth.user!
    const applications = await Application.query()
      .whereHas('accommodation', (q) => q.where('managerId', user.id))
      .where('applicationStatus', 'approved')
      .preload('accommodation')
      .preload('student', (q) => q.preload('user', (u) => u.preload('phoneNumbers')))
      .orderBy('applicationDate', 'asc')
    return response.ok(applications)
  }

  // ─── STUDENT: CONFIRM / DECLINE APPROVED SLOT ────────────────
  async confirm({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)
    const application = await Application.query()
      .where('id', params.id)
      .where('studentNumber', student.studentNumber)
      .whereIn('applicationStatus', ['approved', 'waitlisted'])
      .preload('accommodation')
      .firstOrFail()

    const { action } = request.body()   // 'accept' or 'decline'

    if (action === 'accept') {
      application.applicationStatus = 'confirmed'
      application.slotConfirmedAt = DateTime.now()
      await application.save()
      await LogService.record(user.id, 'application', application.id, 'STUDENT_CONFIRMED')
      return response.ok({ message: 'Slot confirmed successfully.', application })
    }

    if (action === 'decline') {
      await this.waitlistService.processWaitlistCancellation(application.id)
      await LogService.record(user.id, 'application', application.id, 'STUDENT_DECLINED')
      return response.ok({ message: 'Slot declined.' })
    }

    return response.badRequest({ message: 'action must be "accept" or "decline"' })
  }

  // ─── STUDENT: CONFIRM SLOT ───────────────────────────────────
  // After landlord approval, the student has until slotConfirmDeadline to claim
  // the slot. Confirmation stamps slotConfirmedAt; un-claimed slots are later
  // auto-cancelled by the scheduler so the next waitlisted applicant can be promoted.
  async confirmSlot({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    const app = await Application.query()
      .where('id', params.id)
      .where('studentNumber', student.studentNumber)
      .firstOrFail()

    if (app.applicationStatus !== 'approved') {
      return response.badRequest({ message: 'Only approved applications can be confirmed' })
    }
    if (app.slotConfirmedAt) {
      return response.badRequest({ message: 'Slot already confirmed' })
    }
    if (app.slotConfirmDeadline && DateTime.now() > app.slotConfirmDeadline) {
      return response.badRequest({ message: 'Slot confirmation deadline has passed' })
    }

    app.slotConfirmedAt = DateTime.now()
    await app.save()

    await LogService.record(user.id, 'application', app.id, 'STUDENT_CONFIRMED_SLOT')
    return response.ok(app)
  }

  // ─── VIEW ENROLLMENT PROOF ───────────────────────────────────
  async viewEnrollmentProof({ params, response }: HttpContext) {
    const application = await Application.query()
      .where('id', params.id)
      .preload('student', (q) => q.preload('enrollmentProof'))
      .firstOrFail()

    const filePath = application.student?.enrollmentProof?.filePath
    if (!filePath) {
      return response.notFound({ message: 'Enrollment proof not available' })
    }

    let key: string
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      const url = new URL(filePath)
      key = decodeURIComponent(url.pathname.substring(1))
    } else {
      key = filePath.replace(/^\//, '')
    }

    const signedUrl = await drive.use('s3').getSignedUrl(key, { expiresIn: '5 minutes' })
    return { url: signedUrl }
  }

  // ─── MANAGER: VIEW APPLICATIONS (TESTER) ─────────────────────
  async viewApplications({ response }: HttpContext) {
    const applications = await Application.query()
      .preload('accommodation')
      .preload('student', (q) => q.preload('user'))
      .orderBy('applicationDate', 'asc')

    return response.ok(applications)
  }

  // ─── MANAGER: VIEW APPLICANTS ────────────────────────────────
  async viewApplicants({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role === 'manager') {
      const applications = await Application.query()
        .whereHas('accommodation', (q) => q.where('managerId', user.id))
        .preload('accommodation')
        .preload('student', (q) => q.preload('user'))
        .orderBy('applicationDate', 'asc')

      return response.ok(applications)
    }

    return response.forbidden({ message: 'access denied' })
  }

  // ─── MANAGER: VIEW ALL WAITLISTED (TESTER) ───────────────────
  async viewAllWaitlisted({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'manager') {
      return response.forbidden({ message: 'Access denied' })
    }

    const applications = await Application.query()
      .where('applicationStatus', 'waitlisted')
      .preload('student', (s) => s.preload('user'))
      .preload('accommodation')
      .orderBy('applicationDate', 'asc')

    const results = await Promise.all(
      applications.map(async (app) => {
        const assignment = await Assignment.query()
          .where('studentNumber', app.studentNumber)
          .whereHas('room', (r) => r.where('accommodationId', app.accommodationId))
          .preload('room')
          .first()

        return {
          ...app.toJSON(),
          assignment: assignment ? assignment.toJSON() : null,
        }
      })
    )

    return results
  }

  // ─── MANAGER: VIEW WAITLISTED FOR MY ACCOMMODATIONS ──────────
  async viewWaitlisted({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'manager') {
      return response.forbidden({ message: 'Access denied' })
    }

    const applications = await Application.query()
      .where('applicationStatus', 'waitlisted')
      .whereHas('accommodation', (q) => {
        q.where('managerId', user.id)
      })
      .preload('student', (s) => s.preload('user'))
      .preload('accommodation')
      .orderBy('applicationDate', 'asc')

    const results = await Promise.all(
      applications.map(async (app) => {
        const assignment = await Assignment.query()
          .where('studentNumber', app.studentNumber)
          .whereHas('room', (r) => r.where('accommodationId', app.accommodationId))
          .preload('room')
          .first()

        return {
          ...app.toJSON(),
          assignment: assignment ? assignment.toJSON() : null,
        }
      })
    )

    return results
  }
}