// app/controllers/application_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Application from '#models/application'
import Assignment from '#models/assignment'
import Student from '#models/student'
import LogService from '#services/log_service'
import drive from '@adonisjs/drive/services/main'
import WaitlistWorkflowService from '#services/waitlisted_workflow_service'
import Room from '#models/room'
import db from '@adonisjs/lucid/services/db'
import Accommodation from '#models/accommodation'

@inject()
export default class ApplicationsController {
  constructor(protected waitlistService: WaitlistWorkflowService) {}

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

  // ─── STUDENT: SUBMIT APPLICATION ───
  async store({ auth, request, response, serialize }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    const { accommodationId, applicationRoomType, applicationStayType,
            durationOfStayDays, preferredTags } = request.all()

    const activeStay = await Assignment.query()
      .where('studentNumber', student.studentNumber)
      .whereNull('actualMoveOut')
      .first()

    if (activeStay) {
      return response.conflict({ message: 'You already have an active housing assignment.' })
    }

    const newApp = await Application.create({
      accommodationId,
      studentNumber: student.studentNumber,
      applicationRoomType,
      applicationStayType,
      durationOfStayDays,
      applicationStatus: 'pending',
      preferredTags: preferredTags ?? null,
    })

    await LogService.record(user.id, 'application', newApp.id, 'STUDENT_SUBMITTED')
    return serialize(newApp)
  }

  // ─── STUDENT: VIEW MY APPLICATIONS with estimated monthly rent ───
  async index({ auth, response, serialize }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized({ message: 'Unauthorized' })

    const student = await Student.findByOrFail('userId', user.id);

    // Fetch all applications, with accommodation and all rooms (with tags)
    const applications = await Application.query()
      .where('studentNumber', student.studentNumber)
      .preload('accommodation')
      .preload('accommodation', (q) => {
        q.preload('rooms', (roomQuery) => {
          roomQuery.preload('tags')
        })
      })
      .orderBy('applicationDate', 'desc')

    // For each application, compute the cheapest matching room's rent
    for (const app of applications) {
      const accommodationRooms = app.accommodation?.rooms ?? []
      const preferredTags: string[] = app.preferredTags ?? []

      // Filter rooms that match type, stay type, and all preferred tags (if any)
      const matchingRooms = accommodationRooms.filter(room => {
        if (room.roomType !== app.applicationRoomType) return false
        if (room.roomStayType !== app.applicationStayType) return false

        // Tag matching – only if the student specified tags
        if (preferredTags.length > 0) {
          const roomTagNames = room.tags?.map(t => t.tagDetail) ?? []
          if (!preferredTags.every(tag => roomTagNames.includes(tag))) return false
        }
        return true
      })

      const estimatedRent = matchingRooms.length > 0
        ? Math.min(...matchingRooms.map(r => r.roomRent))
        : null

      // Attach computed rent to the application object
      ;(app as any).estimatedMonthlyRent = estimatedRent
    }

    return serialize(applications)
  }

  // ─── MANAGER/LANDLORD: VIEW INCOMING ───
  async incoming({ auth, response, serialize }: HttpContext) {
    const user = auth.user!
    if (user.role === 'manager') {
      const applications = await Application.query()
        .whereHas('accommodation', (q) => q.where('managerId', user.id))
        .whereIn('applicationStatus', ['pending', 'waitlisted'])
        .where('applicationStayType', 'non_transient')
        .preload('accommodation')
        .preload('student', (q) => q.preload('user', (u) => u.preload('phoneNumbers'))) 
        .orderBy('applicationDate', 'asc')
      return serialize(applications)
    }
    if (user.role === 'landlord') {
      const applications = await Application.query()
        .whereHas('accommodation', (q) => q.where('landlordId', user.id))
        .where('applicationStatus', 'under_review')
        .preload('accommodation')
        .preload('student', (q) => q.preload('user'))
        .orderBy('applicationDate', 'asc')
      return serialize(applications)
    }
    return response.forbidden({ message: 'access denied' })
  }

  // ─── MANAGER/LANDLORD: APPROVE OR REJECT ───
  async updateStatus({ auth, request, params, response, serialize }: HttpContext) {
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
      console.log('--- Manager approval attempt ---')
      console.log('User ID:', user.id)
      console.log('Accommodation managerId:', applicationObject.accommodation.managerId)
      console.log('Application status:', applicationObject.applicationStatus)
      console.log('User role:', user.role)
      
      if (applicationObject.accommodation.managerId !== user.id) {
        console.log('403 due to manager mismatch')
        return response.forbidden({ message: 'You do not manage this accommodation.' })
      }
      if (applicationObject.applicationStatus !== 'pending') {
        console.log('400 due to status not pending')
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
      console.log('Approval saved successfully')

      const detail = action === 'approve'
        ? `Manager approved application #${applicationObject.id} for ${applicationObject.student.user.fname} ${applicationObject.student.user.lname}`
        : `Manager rejected application #${applicationObject.id} – ${rejection_reason}`

      await LogService.record(user.id, 'application', applicationObject.id,
        action === 'approve' ? 'MANAGER_APPROVED' : 'MANAGER_REJECTED',
        detail)

      return serialize(applicationObject)  // 
    }
    // Landlord approval – uses injected waitlistService
    if (user.role === 'landlord') {
      if (applicationObject.accommodation.landlordId !== user.id) return response.forbidden()
      if (applicationObject.applicationStatus !== 'under_review') return response.badRequest()

      if (action === 'reject') {
        applicationObject.applicationStatus = 'rejected'
        applicationObject.rejectionReason = rejection_reason
        await applicationObject.save()
        await LogService.record(user.id, 'application', applicationObject.id, 'LANDLORD_REJECTED')
        return serialize(applicationObject)
      }
      applicationObject.reviewedAt = DateTime.now()
      applicationObject.reviewedBy = user.id

      // Use the injected waitlistService
      const updatedApp = await this.waitlistService.processApproval(applicationObject.id)

      const detail = action === 'approve'
        ? `Manager approved application #${applicationObject.id} for ${applicationObject.student.user.fname} ${applicationObject.student.user.lname}`
        : `Manager rejected application #${applicationObject.id} – ${rejection_reason}`

      await LogService.record(user.id, 'application', applicationObject.id,
        action === 'approve' ? 'MANAGER_APPROVED' : 'MANAGER_REJECTED',
        detail)

      return serialize(updatedApp)
    }

    return response.forbidden()
  }

  // ─── STUDENT: CANCEL APPLICATION ───
  async cancel({ auth, params, response, serialize }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)
    const app = await Application.query()
      .where('id', params.id)
      .where('studentNumber', student.studentNumber)
      .firstOrFail()

    if (app.applicationStatus !== 'pending') {
      return response.badRequest({ message: 'Can only cancel pending applications' })
    }
    app.applicationStatus = 'cancelled'
    await app.save()
    await LogService.record(user.id, 'application', app.id, 'STUDENT_CANCELLED')
    return serialize(app)
  }

  // ─── MANAGER: GET CONFIRMED APPLICATIONS FOR DASHBOARD ───
  async approvedForAssignment({ auth, serialize }: HttpContext) {
    const user = auth.user!
    const applications = await Application.query()
      .whereHas('accommodation', (q) => q.where('managerId', user.id))
      .where('applicationStatus', 'approved')
      .preload('accommodation')
      .preload('student', (q) => q.preload('user', (u) => u.preload('phoneNumbers')))
      .orderBy('applicationDate', 'asc')
    return serialize(applications)
  }

  // ─── STUDENT: CONFIRM / DECLINE APPROVED SLOT ───
  async confirm({ auth, params, request, response, serialize }: HttpContext) {
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
      await application.save()
      await LogService.record(user.id, 'application', application.id, 'STUDENT_CONFIRMED')
      return serialize({ message: 'Slot confirmed successfully.', application })
    }

    if (action === 'decline') {
      await this.waitlistService.processWaitlistCancellation(application.id)
      await LogService.record(user.id, 'application', application.id, 'STUDENT_DECLINED')
      return serialize({ message: 'Slot declined.' })
    }

    return response.badRequest({ message: 'action must be "accept" or "decline"' })
  }

  async viewEnrollmentProof({ params, response }: HttpContext) {
    const application = await Application.query()
      .where('id', params.id)
      .preload('student', (q) => q.preload('enrollmentProof'))
      .firstOrFail()

    const filePath = application.student?.enrollmentProof?.filePath
    if (!filePath) {
      return response.notFound({ message: 'Enrollment proof not available' })
    }

    // Determine the object key for the S3 drive
    let key: string

    // Check if the stored path is a full URL
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      // Extract the key from the URL (same as before)
      const url = new URL(filePath)
      key = decodeURIComponent(url.pathname.substring(1))
    } else {
      // Already a relative key – use it directly
      key = filePath.replace(/^\//, '') // remove leading slash if any
    }

    // Generate a signed URL valid for 5 minutes
    const signedUrl = await drive.use('s3').getSignedUrl(key, { expiresIn: '5 minutes' })

    return { url: signedUrl }
  }
}