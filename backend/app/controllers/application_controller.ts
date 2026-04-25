import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Application from '#models/application'
import Assignment from '#models/assignment'
import Student from '#models/student'
import LogService from '#services/log_service'
import { inject } from '@adonisjs/core'
import ApplicationService from '#services/application_service'
import { withPrimaryImageUrl } from '#services/image_service';
@inject()
export default class ApplicationsController {
  
  // ─── 1. STUDENT: SUBMIT APPLICATION ───
  async store({ auth, request, response, serialize }: HttpContext) {    
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id) // Get student_number
    
    const { accommodationId, applicationRoomType, applicationStayType, durationOfStayDays } = request.all()

    // Conflict Prevention: Does the student already have an active stay?
    const activeStay = await Assignment.query()
      .where('studentNumber', student.studentNumber)
      .whereNull('actualMoveOut')
      .first()

    if (activeStay) {
      return response.conflict({ message: 'You already have an active housing assignment.' })
    }

    // Create the application
    const newApp = await Application.create({
      accommodationId,
      studentNumber: student.studentNumber,
      applicationRoomType,
      applicationStayType,
      durationOfStayDays,
      applicationStatus: 'pending',
    })

    await LogService.record(user.id, 'application', newApp.id, 'STUDENT_SUBMITTED')
    return serialize(newApp)
  }

  // ─── 2. STUDENT: VIEW MY APPLICATIONS ───
  async index({ auth, response }: HttpContext) {
    const user = auth.user;

    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' });
    }

    const student = await Student.findByOrFail('userId', user.id);

    // 1. Fetch all applications and preload all required nested relationships on 'accommodation'
    const applications = await Application.query()
      .where('studentNumber', student.studentNumber)
      .preload('reviewer')
      .preload('accommodation', (accommodationQuery) => {
        // Preload rooms and their tags for rent calculation
        accommodationQuery.preload('rooms', (roomQuery) => {
          roomQuery.preload('tags');
        });
        // Preload images and their files for the signed URL
        accommodationQuery.preload('images', (imageQuery) => {
          imageQuery.preload('file');
        });
      })
      .orderBy('applicationDate', 'desc');

    // 2. Process applications to compute rent, attach signed URLs, and serialize
    const data = await Promise.all(
      applications.map(async (app) => {
        // --- A. Compute Estimated Rent ---
        const accommodationRooms = app.accommodation?.rooms ?? [];
        const preferredTags: string[] = (app as any).preferredTags ?? [];

        const matchingRooms = accommodationRooms.filter((room) => {
          if (room.roomType !== app.applicationRoomType) return false;
          if (room.roomStayType !== app.applicationStayType) return false;

          if (preferredTags.length > 0) {
            const roomTagNames = room.tags?.map((t) => t.tagDetail) ?? [];
            if (!preferredTags.every((tag) => roomTagNames.includes(tag))) return false;
          }
          return true;
        });

        const estimatedRent = matchingRooms.length > 0
          ? Math.min(...matchingRooms.map((r) => r.roomRent))
          : null;

        // --- B. Serialize Model to Plain JSON Object ---
        const serializedApp = app.serialize() as any;

        // --- C. Attach Custom Properties ---
        serializedApp.estimatedMonthlyRent = estimatedRent;

        if (app.accommodation) {
          // Resolve B2 signed URL and attach it to the serialized accommodation object
          serializedApp.accommodation = await withPrimaryImageUrl(app.accommodation);
        }

        return serializedApp;
      })
    );

    // Optional: Log to verify the output before returning
    console.log('Merged serialized apps:', data.map(a => ({ id: a.id, estimatedMonthlyRent: a.estimatedMonthlyRent })));

    // Return the fully populated and serialized array
    return data;
  }

  // ─── 3. MANAGER/LANDLORD: VIEW INCOMING ───
  async incoming({ auth, response, serialize }: HttpContext) {
    const user = auth.user!

    if (user.role === 'manager') {
      const applications = await Application.query()
        .whereHas('accommodation', (q) => q.where('managerId', user.id))
        .whereIn('applicationStatus', ['pending', 'waitlisted'])
        .preload('accommodation')
        .preload('student', (q) => q.preload('user'))
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

  // ─── 4. MANAGER/LANDLORD: APPROVE OR REJECT ───
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
      .where('applicationId', params.id)
      .preload('accommodation')
      .firstOrFail()

    if (applicationObject.accommodation.isFrozen) {
      return response.badRequest({
        status: 400,
        error: 'Bad Request',
        message: 'This accommodation is currently frozen. Applications cannot be processed during a manager handover.',
      })
    }

    // Level 1: Manager verification
    if (user.role === 'manager') {
      if (applicationObject.accommodation.managerId !== user.id) return response.forbidden()
      if (applicationObject.applicationStatus !== 'pending') return response.badRequest()

      if (action === 'approve') {
        applicationObject.applicationStatus = 'under_review'
        applicationObject.rejectionReason = null
      } else {
        applicationObject.applicationStatus = 'rejected'
        applicationObject.rejectionReason = rejection_reason
      }

      await applicationObject.save()
      await LogService.record(user.id, 'application', applicationObject.id, action === 'approve' ? 'MANAGER_APPROVED' : 'MANAGER_REJECTED')
      return serialize(applicationObject)
    }

    // Level 2: Landlord verification
    if (user.role === 'landlord') {
      if (applicationObject.accommodation.landlordId !== user.id) return response.forbidden()
      if (applicationObject.applicationStatus !== 'under_review') return response.badRequest()

      if (action === 'approve') {
        const activeAssignment = await Assignment.query()
          .where('studentNumber', applicationObject.studentNumber)
          .whereNull('actualMoveOut')
          .first()

        if (activeAssignment) {
          return response.conflict({ message: 'student already has an active stay, cannot approve' })
        }

        applicationObject.applicationStatus = 'approved'
        applicationObject.rejectionReason = null
      } else {
        applicationObject.applicationStatus = 'rejected'
        applicationObject.rejectionReason = rejection_reason
      }
      applicationObject.reviewedAt = DateTime.now()
      applicationObject.reviewedBy = user.id

      await applicationObject.save()
      await LogService.record(user.id, 'application', applicationObject.id, action === 'approve' ? 'LANDLORD_APPROVED' : 'LANDLORD_REJECTED')
      return serialize(applicationObject)
    }

    return response.forbidden()
  }

  // ─── 5. STUDENT: CANCEL APPLICATION ───
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
}