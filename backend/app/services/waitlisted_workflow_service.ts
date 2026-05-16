import Application from "#models/application"
import Room from "#models/room"
import NotificationService from "#services/notification_service"
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'

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
  const eligibleRooms = matchingRooms.filter(room => {
    const restriction = room.tenantRestriction
    if (restriction === 'coed') return true

    const accRestriction = application.accommodation.tenantRestriction
    const studentGender = application.student.gender.toLowerCase()

    if (accRestriction === 'male-only' && studentGender !== 'male') return false
    if (accRestriction === 'female-only' && studentGender !== 'female') return false

    return true
  })

  if (eligibleRooms.length > 0) {
    // Only mark as approved, DO NOT assign a room automatically
    application.applicationStatus = 'approved'
    application.approvedAt = DateTime.now()
    // application.roomId = eligibleRooms[0].id
    // application.slotConfirmDeadline = ...
    await application.save()

    const roomTags = eligibleRooms[0].tags.map(t => t.tagDetail)
    const preferredTags = application.preferredTags ?? []
    const matchedTags = preferredTags.filter(t => roomTags.includes(t))
    const unmatchedTags = preferredTags.filter(t => !roomTags.includes(t))

    try {
      await this.notificationService.sendApprovalWithTags(
        application.student.user,
        application.accommodation.accommodationName,
        matchedTags,
        unmatchedTags
      )
    } catch (error) {
      console.error("Non-fatal: Failed to send approval email", error)
    }
  } else {
    if (application.applicationStayType === 'transient') {
      application.applicationStatus = 'rejected'
      application.rejectionReason = 'No available rooms for your preferred stay type/dates.'
      await application.save()
    } else {
      const waitlistPosition = await this.getNextWaitlistPosition(application.accommodationId)
      application.applicationStatus = 'waitlisted'
      await application.save()

      try {
        await this.notificationService.sendWaitlistEmail(
          application.student.user,
          application.accommodation.accommodationName,
          waitlistPosition
        )
      } catch (error) {
        console.error("Non-fatal: Failed to send waitlist email", error)
      }
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
    try {
      await this.notificationService.sendSlotExpiredEmail(
        application.student.user,
        application.accommodation.accommodationName
      )
    } catch (error) {
      console.error("Non-fatal: Failed to send slot expiry email", error)
    }
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

    if (!['waitlisted', 'approved'].includes(application.applicationStatus)) {
      throw new Error('Application is not waitlisted or approved')
    }
    application.applicationStatus = 'cancelled'
    await application.save()
    try {
      await this.notificationService.sendCancellationEmail(
        application.student.user,
        application.accommodation.accommodationName
      )
    } catch (error) {
       console.error("Non-fatal: Failed to send cancellation email", error)
    }
  }

  // ─── Promote next waitlisted applicant ───
  // When a room is supplied, candidates are filtered by matching stay/room type
  // and ranked by tag overlap with the freed room's tags (highest match wins;
  // application date breaks ties — older first). Without a room, falls back to FIFO.
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

  const candidates = await query
  if (candidates.length === 0) return

  if (room && candidates.length > 1) {
    const roomTags = room.tags?.map(t => t.tagDetail) ?? []
    const scored = candidates.map(candidate => {
      let preferredTags: string[] = []
      if (Array.isArray(candidate.preferredTags)) {
        preferredTags = candidate.preferredTags
      } else if (typeof candidate.preferredTags === 'string') {
        try {
          const parsed = JSON.parse(candidate.preferredTags)
          preferredTags = Array.isArray(parsed) ? parsed : []
        } catch {
          preferredTags = []
        }
      }
      const matchCount = preferredTags.filter(tag => roomTags.includes(tag)).length
      return { candidate, matchCount }
    })
    scored.sort((a, b) => {
      if (a.matchCount !== b.matchCount) return b.matchCount - a.matchCount
      return a.candidate.applicationDate.valueOf() - b.candidate.applicationDate.valueOf()
    })
    const best = scored[0].candidate
    best.applicationStatus = 'approved'
    best.approvedAt = DateTime.now()
    // DO NOT auto-assign room - manager will assign
    await best.save()
    try {
      await this.notificationService.sendApplicationStatusEmail(
        best.student.user, 'approved', best.accommodation.accommodationName
      )
    } catch(error) {
      console.error("Non-fatal: Failed to send waitlist promotion email", error)
    }
  } else {
    const next = candidates[0]
    next.applicationStatus = 'approved'
    next.approvedAt = DateTime.now()
    // DO NOT auto-assign room - manager will assign
    await next.save()
    try {
      await this.notificationService.sendApplicationStatusEmail(
        next.student.user, 'approved', next.accommodation.accommodationName
      )
    } catch(error) {
      console.error("Non-fatal: Failed to send waitlist promotion email", error)
    }
  }
}

  private async getNextWaitlistPosition(accommodationId: number) {
    const waitlistCount = await Application.query()
      .where('accommodation_id', accommodationId)
      .where('application_status', 'waitlisted')
      .count('* as total')
    return Number(waitlistCount[0].$extras.total) + 1
  }
}