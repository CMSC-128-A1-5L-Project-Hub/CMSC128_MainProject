import type { HttpContext } from '@adonisjs/core/http'
import Application from '#models/application'
import Assignment from '#models/assignment'
import Student from '#models/student'
import LogService from '#services/log_service'

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
  async index({ auth, serialize }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    const applications = await Application.query()
      .where('studentNumber', student.studentNumber)
      .preload('accommodation')
      .orderBy('applicationDate', 'desc')

    return serialize(applications)
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

      await applicationObject.save()
      await LogService.record(user.id, 'application', applicationObject.id, action === 'approve' ? 'LANDLORD_APPROVED' : 'LANDLORD_REJECTED')
      return serialize(applicationObject)
    }

    return response.forbidden()
  }

  // ─── 5. STUDENT: CANCEL APPLICATION ───
  async destroy({ auth, params, response, serialize }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    const app = await Application.query()
      .where('applicationId', params.id)
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