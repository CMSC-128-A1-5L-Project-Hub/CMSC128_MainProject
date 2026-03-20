import type { HttpContext } from '@adonisjs/core/http'
import application from '#models/application'
import assignment from '#models/assignment'
import accommodation from '#models/accommodation'
import LogService from '#services/log_service'

export default class ApplicationsController {
  // Student function: submit application to applications table
  async store({ auth, request, response }: HttpContext) {
    // 1. Validate the accommodation exists
    // 2. Check "Conflict Prevention" - no multiple active stays
    // 3. Create entry in applications table
    // 4. Trigger Audit Log
  }

  // Student function: get list of applications
  async index({ auth }: HttpContext) {
    // GET (/api/v1/applications/my-applications)
  }

  // route should be like this: /applications/incoming
  // managers see pending applications for their accommodations
  // landlords see under_review applications (already passed manager review)
  async incoming({ response, session }: HttpContext) {
    const userId = session.get('userId')
    const role = session.get('role')

    if (role === 'manager') {
      const applications = await application
        .query()
        .whereHas('accommodation', (q) => {
          q.where('manager_id', userId)
        })
        .whereIn('applicationStatus', ['pending', 'waitlisted'])
        .preload('accommodation')
        .preload('student', (q) => q.preload('user'))
        .orderBy('applicationDate', 'asc')

      return response.ok({ status: 200, data: applications })
    }

    if (role === 'landlord') {
      const applications = await application
        .query()
        .whereHas('accommodation', (q) => {
          q.where('landlord_id', userId)
        })
        .where('applicationStatus', 'under_review')
        .preload('accommodation')
        .preload('student', (q) => q.preload('user'))
        .orderBy('applicationDate', 'asc')

      return response.ok({ status: 200, data: applications })
    }

    return response.forbidden({ message: 'access denied' })
  }

  // Landlord/Manager function: Update status of application (Landlords and managers can just use one function, just add in an if condition to check their roles in the function)
  // route should be like this: /applications/<applicationId>/review
  // body should look like this:
  // {
  //   "action": "approve" or "reject",
  //   "rejection_reason": "reason here" (required only if action is reject)
  // }
  async updateStatus({ request, params, response, session }: HttpContext) {
    const userId = session.get('userId')
    const role = session.get('role')

    const { action, rejection_reason } = request.body()

    // basic validation on action and rejection_reason
    if (!action || !['approve', 'reject'].includes(action)) {
      return response.badRequest({
        message: 'action must be approve or reject',
      })
    }

    if (action === 'reject' && !rejection_reason) {
      return response.badRequest({
        message: 'rejection_reason is required when rejecting',
      })
    }

    let applicationObject
    try {
      applicationObject = await application
        .query()
        .where('applicationId', params.id)
        .preload('accommodation')
        .firstOrFail()
    } catch (error) {
      return response.notFound({
        message: 'no application found with the given id',
      })
    }

    // Level 1: Manager verification
    // Check if user is manager and application status is pending; Then accept or reject. if reject, give reason why, if accept change application status to under_review
    // approve moves it to under_review, reject ends it here
    if (role === 'manager') {
      if (applicationObject.accommodation.managerId !== userId) {
        return response.forbidden({
          message: 'you are not the manager of this accommodation',
        })
      }

      if (applicationObject.applicationStatus !== 'pending') {
        return response.badRequest({
          message: `manager can only review pending applications. current status: ${applicationObject.applicationStatus}`,
        })
      }

      if (action === 'approve') {
        applicationObject.applicationStatus = 'under_review'
        applicationObject.rejectionReason = null
      } else {
        applicationObject.applicationStatus = 'rejected'
        applicationObject.rejectionReason = rejection_reason
      }

      await applicationObject.save()

      // audit log
      await LogService.record(
        userId,
        'application',
        applicationObject.applicationId,
        action === 'approve' ? 'MANAGER_APPROVED' : 'MANAGER_REJECTED',
        action === 'approve'
          ? `Manager ${userId} forwarded Application ${applicationObject.applicationId} to landlord for review.`
          : `Manager ${userId} rejected Application ${applicationObject.applicationId}. Reason: ${rejection_reason}`
      )

      return response.ok({
        message:
          action === 'approve'
            ? 'application forwarded to landlord for final review'
            : 'application rejected',
        data: applicationObject,
      })
    }

    // Level 2: Landlord verification
    // check if user is landlord and application status is under_review; Then accept or reject. if reject, give reason why, if accept change application status to approved
    // oh and audit log it as well
    // save and return application here.
    // approve fully approves it, reject ends it here
    if (role === 'landlord') {
      if (applicationObject.accommodation.landlordId !== userId) {
        return response.forbidden({
          message: 'you are not the landlord of this accommodation',
        })
      }

      if (applicationObject.applicationStatus !== 'under_review') {
        return response.badRequest({
          message: `landlord can only review under_review applications. current status: ${applicationObject.applicationStatus}`,
        })
      }

      if (action === 'approve') {
        // conflict check: student shouldn't already have an active stay
        const activeAssignment = await assignment
          .query()
          .where('studentNumber', applicationObject.studentNumber)
          .whereNull('actualMoveOut')
          .first()

        if (activeAssignment) {
          return response.conflict({
            message: 'student already has an active stay, cannot approve',
          })
        }

        applicationObject.applicationStatus = 'approved'
        applicationObject.rejectionReason = null
      } else {
        applicationObject.applicationStatus = 'rejected'
        applicationObject.rejectionReason = rejection_reason
      }

      await applicationObject.save()

      // audit log
      await LogService.record(
        userId,
        'application',
        applicationObject.applicationId,
        action === 'approve' ? 'LANDLORD_APPROVED' : 'LANDLORD_REJECTED',
        action === 'approve'
          ? `Landlord ${userId} fully approved Application ${applicationObject.applicationId}.`
          : `Landlord ${userId} rejected Application ${applicationObject.applicationId}. Reason: ${rejection_reason}`
      )

      return response.ok({
        message: action === 'approve' ? 'application fully approved' : 'application rejected',
        data: applicationObject,
      })
    }

    return response.forbidden({
      message: 'only managers and landlords can review applications',
    })
  }

  // Student function: cancel application
  async destroy({ auth, params }: HttpContext) {
    // Logic: Cancel while its still pending.
    // add audit log
  }

  // more functions? kung may maisip kayo na kailangan pa forda applications
}
