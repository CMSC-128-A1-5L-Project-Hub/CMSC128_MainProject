// app/controllers/assignments_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
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

  // ─── MANAGER: ALL ASSIGNMENTS FOR DASHBOARD ───
  async managerIndex({ auth, serialize }: HttpContext) {
    const user = auth.user!
    const accommodations = await Accommodation.query().where('managerId', user.id)
    const accIds = accommodations.map(a => a.id)
    if (accIds.length === 0) return serialize([])

    const rooms = await Room.query().whereIn('accommodationId', accIds)
    const roomIds = rooms.map(r => r.id)

    const assignments = await Assignment.query()
      .whereIn('roomId', roomIds)
      .preload('room', (q) => q.preload('accommodation'))
      .preload('student', (q) => q.preload('user'))
      .orderBy('moveIn', 'asc')

    return serialize(assignments)
  }

  // ─── MANAGER/LANDLORD: ASSIGN ROOM (Slot Confirmed → Assigned) ───
  // Manager: subject to the existing-assignment conflict guard.
  // Landlord: may override an existing assignment by transactionally releasing the
  //   prior room (decrement occupancy, cancel old assignment) before creating the new one.
async store({ auth, request, response, serialize }: HttpContext) {
  const user = auth.user!
  const { applicationId, roomId, moveIn, expectedMoveOut, gracePeriodDays } = request.body()

  if (!applicationId || !roomId || !moveIn || !expectedMoveOut) {
    return response.badRequest({
      message: 'applicationId, roomId, moveIn, and expectedMoveOut are required',
    })
  }

  // Load application with accommodation and student
  const application = await Application.query()
    .where('id', applicationId)
    .preload('accommodation')
    .preload('student', (q) => q.preload('user'))
    .firstOrFail()

  const accommodation = application.accommodation

  // Authorize: manager must manage this accommodation
  if (user.role !== 'manager' || accommodation.managerId !== user.id) {
    return response.forbidden({ message: 'You do not manage this accommodation' })
  }

  // State gate: application must be approved (not yet confirmed by student)
  if (application.applicationStatus !== 'approved') {
    return response.badRequest({ message: 'Application is not approved' })
  }

  // Prevent double assignment for this student (active/pending)
  const existingAssignment = await Assignment.query()
    .where('studentNumber', application.studentNumber)
    .whereNull('actualMoveOut')
    .whereNotIn('confirmationStatus', ['rejected', 'cancelled'])
    .first()
  if (existingAssignment) {
    return response.conflict({ message: 'Student already has a pending or active assignment' })
  }

  // Load the target room
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

  // Create the assignment – status is pending until student confirms
  const assignment = await Assignment.create({
    studentNumber: application.studentNumber,
    roomId: room.id,
    confirmedDate: DateTime.now(),
    moveIn: DateTime.fromISO(moveIn),
    expectedMoveOut: DateTime.fromISO(expectedMoveOut),
    gracePeriodDays: gracePeriodDays ?? 5,
    confirmationStatus: 'pending_confirmation',
  })

  // Update room occupancy
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

    // Authorize
    if (user.role === 'manager' && accommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage this accommodation' })
    }
    if (user.role === 'landlord' && accommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own this accommodation' })
    }

    if (assignment.actualMoveOut) {
      return response.badRequest({ message: 'Already moved out' })
    }

    assignment.actualMoveOut = actualMoveOut ? DateTime.fromISO(actualMoveOut) : DateTime.now()
    await assignment.save()

    // Free up room
    room.roomCurrentOccupancy = Math.max(0, room.roomCurrentOccupancy - 1)
    if (room.roomAvailability === 'occupied') {
      room.roomAvailability = 'available'
    }
    await room.save()

    // Promote next waitlisted student
    await this.waitlistService.processMoveOut(accommodation.id, room)

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

  // ─── MANAGER: VIEW ALL ASSIGNMENTS (TESTER) ───
  async viewAllAssignments({ auth, response, serialize }: HttpContext) {
    const user = auth.user!
    if (user.role !== 'manager') return response.forbidden({ message: 'access denied' })

    const assignments = await Assignment.query()
      .preload('room', (roomQuery: ModelQueryBuilderContract<typeof Room>) => {
        roomQuery.preload('accommodation')
      })
      .preload('student', (studentQuery: ModelQueryBuilderContract<typeof Student>) => {
        studentQuery.preload('user')
      })

    return serialize(assignments)
  }

  // ─── MANAGER: VIEW ASSIGNMENTS FOR MY ACCOMMODATIONS ───
  async viewAssignments({ auth, response, serialize }: HttpContext) {
    const user = auth.user!
    if (user.role !== 'manager') return response.forbidden({ message: 'access denied' })

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