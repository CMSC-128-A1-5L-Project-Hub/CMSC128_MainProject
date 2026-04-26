import type { HttpContext } from '@adonisjs/core/http'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import Application from '#models/application'
import Assignment from '#models/assignment'
import Room from '#models/room'
import Student from '#models/student'
import LogService from '#services/log_service'
import NotificationService from '#services/notification_service'
import WaitlistWorkflowService from '#services/waitlisted_workflow_service'
import { withPrimaryImageUrl } from '#services/image_service'
import Accommodation from '#models/accommodation'

@inject()
export default class AssignmentsController {
  constructor(
    protected notificationService: NotificationService,
    protected waitlistService: WaitlistWorkflowService
  ) {}

  // ─── 1. MANAGER/LANDLORD: ASSIGN ROOM (Slot Confirmed → Assigned) ───
  // POST /assignments
  async store({ auth, request, response, serialize }: HttpContext) {
    const user = auth.user!
    const { applicationId, roomId, moveIn, expectedMoveOut, gracePeriodDays } = request.body()

    if (!applicationId || !roomId || !moveIn || !expectedMoveOut) {
      return response.badRequest({
        message: 'applicationId, roomId, moveIn, and expectedMoveOut are required',
      })
    }

    // Load the application + accommodation + student so we can authorize, gate, and notify
    const application = await Application.query()
      .where('id', applicationId)
      .preload('accommodation')
      .preload('student', (q) => q.preload('user'))
      .firstOrFail()

    const accommodation = application.accommodation

    // Authorize: caller must own (landlord) or manage the accommodation
    if (user.role === 'manager' && accommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage this accommodation' })
    }
    if (user.role === 'landlord' && accommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own this accommodation' })
    }

    // State machine gate: must be Approved AND Slot Confirmed
    if (application.applicationStatus !== 'approved') {
      return response.badRequest({ message: 'Application is not approved' })
    }
    if (!application.slotConfirmedAt) {
      return response.badRequest({ message: 'Student has not confirmed their slot' })
    }

    // Conflict prevention: student cannot have another active assignment
    const activeAssignment = await Assignment.query()
      .where('studentNumber', application.studentNumber)
      .whereNull('actualMoveOut')
      .first()
    if (activeAssignment) {
      return response.conflict({ message: 'Student already has an active assignment' })
    }

    // Load the target room and validate it
    const room = await Room.findOrFail(roomId)

    if (room.accommodationId !== accommodation.id) {
      return response.badRequest({ message: 'Room does not belong to this accommodation' })
    }
    if (
      room.roomType !== application.applicationRoomType ||
      room.roomStayType !== application.applicationStayType
    ) {
      return response.badRequest({ message: 'Room type does not match application' })
    }
    if (room.roomCurrentOccupancy >= room.roomCapacity) {
      return response.conflict({ message: 'Room is full' })
    }

    // Create the assignment
    const assignment = await Assignment.create({
      studentNumber: application.studentNumber,
      roomId: room.id,
      confirmedDate: DateTime.now(),
      moveIn: DateTime.fromISO(moveIn),
      expectedMoveOut: DateTime.fromISO(expectedMoveOut),
      gracePeriodDays: gracePeriodDays ?? 5,
    })

    // Bump room occupancy; flip availability if room is now full
    room.roomCurrentOccupancy += 1
    if (room.roomCurrentOccupancy >= room.roomCapacity) {
      room.roomAvailability = 'occupied'
    }
    await room.save()

    // Notify the student
    await this.notificationService.sendRoomAssignmentEmail(
      application.student.user,
      accommodation.accommodationName,
      room.roomNumber,
      room.roomBuilding,
      assignment.moveIn.toISODate() ?? ''
    )

    await LogService.record(user.id, 'assignment', assignment.id, 'MANAGER_ASSIGNED_ROOM')
    return serialize(assignment)
  }

  // ─── 2. MANAGER/LANDLORD: RECORD MOVE-OUT (triggers waitlist promotion) ───
  // PATCH /assignments/:id/move-out
  async moveOut({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.user!
    const { actualMoveOut } = request.body()

    const assignment = await Assignment.query()
      .where('id', params.id)
      .preload('room', (q) => q.preload('accommodation'))
      .firstOrFail()

    const room = assignment.room
    const accommodation = room.accommodation

    // Authorize: caller must own or manage the accommodation
    if (user.role === 'manager' && accommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage this accommodation' })
    }
    if (user.role === 'landlord' && accommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own this accommodation' })
    }

    if (assignment.actualMoveOut) {
      return response.badRequest({ message: 'Already moved out' })
    }

    // Stamp move-out (caller-supplied date or today)
    assignment.actualMoveOut = actualMoveOut ? DateTime.fromISO(actualMoveOut) : DateTime.now()
    await assignment.save()

    // Free up room: decrement occupancy (clamp at 0), flip 'occupied' → 'available'
    room.roomCurrentOccupancy = Math.max(0, room.roomCurrentOccupancy - 1)
    if (room.roomAvailability === 'occupied') {
      room.roomAvailability = 'available'
    }
    await room.save()

    // Promote next waitlisted applicant for this accommodation
    await this.waitlistService.processMoveOut(accommodation.id)

    await LogService.record(user.id, 'assignment', assignment.id, 'MOVED_OUT')
    return serialize(assignment)
  }

  // ─── 3. STUDENT: VIEW CURRENT STAY ───
  // GET /my-stay/current
  async currentStay({ auth, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    const assignment = await Assignment.query()
      .where('studentNumber', student.studentNumber)
      .whereNull('actualMoveOut')
      .preload('room', (q) =>
        q.preload('tags').preload('accommodation', (a) =>
          a.preload('images', (i) => i.preload('file'))
        )
      )
      .first()

    if (!assignment) return response.ok(null)

    return response.ok(await this.shapeStayResponse(assignment))
  }

  // ─── 4. STUDENT: VIEW PAST STAYS ───
  // GET /my-stay/history
  async stayHistory({ auth, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    const assignments = await Assignment.query()
      .where('studentNumber', student.studentNumber)
      .whereNotNull('actualMoveOut')
      .preload('room', (q) =>
        q.preload('tags').preload('accommodation', (a) =>
          a.preload('images', (i) => i.preload('file'))
        )
      )
      .orderBy('actualMoveOut', 'desc')

    const data = await Promise.all(assignments.map((a) => this.shapeStayResponse(a)))
    return response.ok(data)
  }

  // ─── MANAGER: VIEW ASSIGNMENTS //TESTER ───
  async viewAllAssignments({ auth, response, serialize }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'manager') {
      return response.forbidden({ message: 'access denied' })
    }

    const assignments = await Assignment.query()
      .preload('room', (roomQuery: ModelQueryBuilderContract<typeof Room>) => {
        roomQuery.preload('accommodation')
      })
      .preload('student', (studentQuery: ModelQueryBuilderContract<typeof Student>) => {
        studentQuery.preload('user')
      })

    return serialize(assignments)
  }

  // ─── MANAGER: VIEW ASSIGNMENTS ───
  async viewAssignments({ auth, response, serialize }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'manager') {
      return response.forbidden({ message: 'access denied' })
    }

    const assignments = await Assignment.query()
      .whereHas('room', (roomQuery: ModelQueryBuilderContract<typeof Room>) => {
        roomQuery.whereHas('accommodation', (accommodationQuery: ModelQueryBuilderContract<typeof Accommodation>) => {
          accommodationQuery.where('managerId', user.id)
        })
      })
      .preload('room', (roomQuery: ModelQueryBuilderContract<typeof Room>) => {
        roomQuery.preload('accommodation')
      })
      .preload('student', (studentQuery: ModelQueryBuilderContract<typeof Student>) => {
        studentQuery.preload('user')
      })

    return serialize(assignments)
  }
  
  // ─── helper: shape an Assignment into the frontend's AccommodationHistoryItem ───
  private async shapeStayResponse(assignment: Assignment): Promise<any> {
    const room = assignment.room
    const accommodation = room.accommodation
    const accommodationWithImage = await withPrimaryImageUrl(accommodation)

    return {
      id: assignment.id,
      roomId: assignment.roomId,
      moveIn: assignment.moveIn?.toISODate() ?? null,
      expectedMoveOut: assignment.expectedMoveOut?.toISODate() ?? null,
      actualMoveOut: assignment.actualMoveOut?.toISODate() ?? null,
      room: {
        roomName: room.roomNumber,
        monthlyRate: room.roomRent,
        roomType: room.roomType,
        accommodation: {
          accommodationName: accommodation.accommodationName,
          accommodationType: accommodation.accommodationType,
          primaryImageUrl: accommodationWithImage.primaryImageUrl,
        },
      },
      review: null, // TODO: preload Review when the relation is wired in
    }
  }
}
