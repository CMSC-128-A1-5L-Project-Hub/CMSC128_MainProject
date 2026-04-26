import Application from "#models/application"
import Room from "#models/room"
import NotificationService from "#services/notification_service"
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'

@inject()
export default class WaitlistWorkflowService {
  constructor(protected notificationService: NotificationService) {}

  // ─── Called when landlord approves an application ───
  async processApproval(applicationId: number) {
    const application = await Application.query()
      .where('id', applicationId)
      .preload('student', (q) => q.preload('user'))
      .preload('accommodation')
      .firstOrFail()

    const matchingRooms = await Room.query()
      .where('accommodation_id', application.accommodationId)
      .where('room_type', application.applicationRoomType)
      .where('room_stay_type', application.applicationStayType)
      .where('room_availability', 'available')
      .preload('tags')
      .select('*')

    // Apply tenant restriction (gender)
    const accRestriction = application.accommodation.tenantRestriction
    const studentGender = application.student.gender
    const eligibleRooms = matchingRooms.filter(room => {
      if (room.tenantRestriction === 'non-coed') {
        if (accRestriction === 'male-only' && studentGender !== 'Male') return false
        if (accRestriction === 'female-only' && studentGender !== 'Female') return false
      }
      return true
    })

    if (eligibleRooms.length > 0) {
      application.applicationStatus = 'approved'
      application.approvedAt = DateTime.now()
      await application.save()

      const roomTags = eligibleRooms[0].tags.map(t => t.tagDetail)
      const preferredTags = application.preferredTags ?? []
      const matchedTags = preferredTags.filter(t => roomTags.includes(t))
      const unmatchedTags = preferredTags.filter(t => !roomTags.includes(t))

      await this.notificationService.sendApprovalWithTags(
        application.student.user,
        application.accommodation.accommodationName,
        matchedTags,
        unmatchedTags
      )
    } else {
      if (application.applicationStayType === 'transient') {
        application.applicationStatus = 'rejected'
        application.rejectionReason = 'No available rooms for your preferred stay type/dates.'
        await application.save()
      } else {
        const waitlistPosition = await this.getNextWaitlistPosition(application.accommodationId)
        application.applicationStatus = 'waitlisted'
        await application.save()
        await this.notificationService.sendWaitlistEmail(
          application.student.user,
          application.accommodation.accommodationName,
          waitlistPosition
        )
      }
    }

    return application
  }

  // ─── Called when a slot confirmation deadline expires ───
  async processSlotExpiry(applicationId: number) {
    const application = await Application.query()
      .where('id', applicationId)
      .preload('student', (q) => q.preload('user'))
      .preload('accommodation')
      .firstOrFail()

    application.applicationStatus = 'cancelled'
    await application.save()

    await this.notificationService.sendSlotExpiredEmail(
      application.student.user,
      application.accommodation.accommodationName
    )

    await this.promoteNextWaitlisted(application.accommodationId)
  }

  // ─── Called when a room becomes free after move-out ───
  async processMoveOut(accommodationId: number, room?: Room) {
    await this.promoteNextWaitlisted(accommodationId, room)
  }

  // ─── Called when a waitlisted student cancels their application ───
  async processWaitlistCancellation(applicationId: number) {
    const application = await Application.query()
      .where('id', applicationId)
      .preload('student', (q) => q.preload('user'))
      .preload('accommodation')
      .firstOrFail()

    if (application.applicationStatus !== 'waitlisted') {
      throw new Error('Application is not waitlisted.')
    }

    application.applicationStatus = 'cancelled'
    await application.save()

    await this.notificationService.sendCancellationEmail(
      application.student.user,
      application.accommodation.accommodationName
    )
  }

  // ─── Promote next waitlisted applicant ───
  private async promoteNextWaitlisted(accommodationId: number, room?: Room) {
    let query = Application.query()
      .where('accommodation_id', accommodationId)
      .where('application_status', 'waitlisted')
      .orderBy('application_date', 'asc')
      .preload('student', (q) => q.preload('user'))
      .preload('accommodation')

    if (room) {
      query = query
        .where('application_stay_type', room.roomStayType)
        .where('application_room_type', room.roomType)
    }

    const next = await query.first()
    if (!next) return

    next.applicationStatus = 'approved'
    next.approvedAt = DateTime.now()
    await next.save()

    await this.notificationService.sendApplicationStatusEmail(
      next.student.user,
      'approved',
      next.accommodation.accommodationName
    )
  }

  private async getNextWaitlistPosition(accommodationId: number) {
    const waitlistCount = await Application.query()
      .where('accommodation_id', accommodationId)
      .where('application_status', 'waitlisted')
      .count('* as total')
    return Number(waitlistCount[0].$extras.total) + 1
  }

  async getWaitlistPosition(applicationId: number): Promise<number> {
    const application = await Application.findOrFail(applicationId)
    const position = await Application.query()
      .where('accommodation_id', application.accommodationId)
      .where('application_status', 'waitlisted')
      .where('application_date', '<', application.applicationDate.toJSDate())
      .count('* as total')
    return Number(position[0].$extras.total)
  }
}
