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
  async managerIndex({ auth, response }: HttpContext) {
    const user = auth.user!
    const accommodations = await Accommodation.query().where('managerId', user.id)
    const accIds = accommodations.map(a => a.id)
    if (accIds.length === 0) return response.ok([])

    const rooms = await Room.query().whereIn('accommodationId', accIds)
    const roomIds = rooms.map(r => r.id)

    const assignments = await Assignment.query()
      .whereIn('roomId', roomIds)
      .preload('room', (q) => q.preload('accommodation'))
      .preload('student', (q) => q.preload('user'))
      .orderBy('moveIn', 'asc')

    return response.ok(assignments)
  }

  // ─── MANAGER/LANDLORD: ASSIGN ROOM (Slot Confirmed → Assigned) ───
  // Manager: subject to the existing-assignment conflict guard.
  // Landlord: may override an existing assignment by transactionally releasing the
  //   prior room (decrement occupancy, cancel old assignment) before creating the new one.
async store({ auth, request, response }: HttpContext) {
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
  if (user.role === 'manager' && accommodation.managerId !== user.id) {
    return response.forbidden({ message: 'You do not manage this accommodation' })
  }
  if (user.role === 'landlord' && accommodation.landlordId !== user.id) {
    return response.forbidden({ message: 'You do not own this accommodation' })
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

    // start transaction 
    const trx = await db.transaction()

    try {
      // handle ovveride logic
      if (existingAssignment) {
        if (user.role === 'landlord') {
          // release the old room
          const oldRoom = await Room.findOrFail(existingAssignment.roomId)
          oldRoom.roomCurrentOccupancy = Math.max(0, oldRoom.roomCurrentOccupancy - 1)
          if (oldRoom.roomAvailability === 'occupied') {
            oldRoom.roomAvailability = 'available'
          }
          await oldRoom.useTransaction(trx).save()

          // cancel the old assignment
          existingAssignment.confirmationStatus = 'cancelled'
          await existingAssignment.useTransaction(trx).save()
        } else {
          // managers cannot override
          await trx.rollback()
          return response.conflict({ message: 'Student already has a pending or active assignment' })
        }
      }

      // load the target room
      const room = await Room.findOrFail(roomId)

      // room validations
      if (room.accommodationId !== accommodation.id) {
        await trx.rollback()
        return response.badRequest({ message: 'Room does not belong to this accommodation' })
      }
      if (room.roomType !== application.applicationRoomType || room.roomStayType !== application.applicationStayType) {
        await trx.rollback()
        return response.badRequest({ message: 'Room type does not match application' })
      }
      if (room.roomCurrentOccupancy >= room.roomCapacity) {
        await trx.rollback()
        return response.conflict({ message: 'Room is full' })
      }

      // create the new assignment using the transaction
      const assignment = new Assignment()
      assignment.studentNumber = application.studentNumber
      assignment.roomId = room.id
      assignment.confirmedDate = DateTime.now()
      assignment.moveIn = DateTime.fromISO(moveIn)
      assignment.expectedMoveOut = DateTime.fromISO(expectedMoveOut)
      assignment.gracePeriodDays = gracePeriodDays ?? 5
      assignment.confirmationStatus = 'pending_confirmation'
      
      await assignment.useTransaction(trx).save()

      // update new room occupancy
      room.roomCurrentOccupancy += 1
      if (room.roomCurrentOccupancy >= room.roomCapacity) {
        room.roomAvailability = 'occupied'
      }
      await room.useTransaction(trx).save()

      // commit traansaction
      await trx.commit()

      // notify the student
      await this.notificationService.sendRoomAssignmentEmail(
        application.student.user,
        accommodation.accommodationName,
        room.roomNumber,
        room.roomBuilding,
        assignment.moveIn.toISODate() ?? ''
      )

      try {
        if (existingAssignment && user.role === 'landlord') {
          await LogService.record(
            user.id,
            'assignment',
            assignment.id,
            'LANDLORD_ASSIGNED_ROOM_OVERRIDE',
            `Landlord ${user.id} overrode existing assignment ${existingAssignment.id} and assigned student ${application.studentNumber} to room ${room.roomNumber} (building ${room.roomBuilding})`
          )
        } else {
          const activityType =
            user.role === 'manager' ? 'MANAGER_ASSIGNED_ROOM' : 'LANDLORD_ASSIGNED_ROOM'
          await LogService.record(
            user.id,
            'assignment',
            assignment.id,
            activityType,
            `${user.role === 'manager' ? 'Manager' : 'Landlord'} ${user.id} assigned student ${application.studentNumber} to room ${room.roomNumber} (building ${room.roomBuilding}) at "${accommodation.accommodationName}"`
          )
        }
      } catch (e) {
        console.error('Failed to log assignment creation:', e)
      }
      return response.ok(assignment)

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  // ─── 2. MANAGER/LANDLORD: RECORD MOVE-OUT (triggers waitlist promotion) ───
  // PATCH /assignments/:id/move-out
  async moveOut({ auth, params, request, response }: HttpContext) {
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
    return response.ok(assignment)
  }

  // ─── MANAGER/LANDLORD: TRANSFER active assignment to a different room ───
  // PATCH /assignments/:id/transfer  body: { targetRoomId }
  async transfer({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const { targetRoomId } = request.body()

    if (!targetRoomId) {
      return response.badRequest({ message: 'targetRoomId is required' })
    }

    const assignment = await Assignment.query()
      .where('id', params.id)
      .preload('room', (q) => q.preload('accommodation'))
      .firstOrFail()

    if (assignment.confirmationStatus !== 'active') {
      return response.badRequest({ message: 'Only active assignments can be transferred' })
    }

    const sourceRoom = assignment.room
    const sourceAccommodation = sourceRoom.accommodation

    if (user.role === 'manager' && sourceAccommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage this accommodation' })
    }
    if (user.role === 'landlord' && sourceAccommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own this accommodation' })
    }

    const targetRoom = await Room.query()
      .where('id', targetRoomId)
      .preload('accommodation')
      .firstOrFail()

    if (user.role === 'manager' && targetRoom.accommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage the target accommodation' })
    }
    if (user.role === 'landlord' && targetRoom.accommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own the target accommodation' })
    }

    if (targetRoom.id === sourceRoom.id) {
      return response.badRequest({ message: 'Target room must differ from current room' })
    }
    if (targetRoom.roomType !== sourceRoom.roomType) {
      return response.badRequest({ message: 'Target room type must match current room type' })
    }
    if (targetRoom.roomCurrentOccupancy >= targetRoom.roomCapacity) {
      return response.conflict({ message: 'Target room is full' })
    }

    const trx = await db.transaction()
    try {
      sourceRoom.roomCurrentOccupancy = Math.max(0, sourceRoom.roomCurrentOccupancy - 1)
      if (sourceRoom.roomAvailability === 'occupied' && sourceRoom.roomCurrentOccupancy < sourceRoom.roomCapacity) {
        sourceRoom.roomAvailability = 'available'
      }
      await sourceRoom.useTransaction(trx).save()

      targetRoom.roomCurrentOccupancy += 1
      if (targetRoom.roomCurrentOccupancy >= targetRoom.roomCapacity) {
        targetRoom.roomAvailability = 'occupied'
      }
      await targetRoom.useTransaction(trx).save()

      assignment.roomId = targetRoom.id
      await assignment.useTransaction(trx).save()

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }

    await LogService.record(
      user.id,
      'assignment',
      assignment.id,
      'ASSIGNMENT_TRANSFERRED',
      `Transferred assignment ${assignment.id} from room ${sourceRoom.id} to room ${targetRoom.id}`
    )

    await assignment.load('room', (q) => q.preload('accommodation'))
    await assignment.load('student', (q) => q.preload('user'))
    return response.ok(assignment)
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
  async viewAllAssignments({ auth, response }: HttpContext) {
    const user = auth.user!
    if (user.role !== 'manager') return response.forbidden({ message: 'access denied' })

    const assignments = await Assignment.query()
      .preload('room', (roomQuery: ModelQueryBuilderContract<typeof Room>) => {
        roomQuery.preload('accommodation')
      })
      .preload('student', (studentQuery: ModelQueryBuilderContract<typeof Student>) => {
        studentQuery.preload('user')
      })

    return response.ok(assignments)
  }

  // ─── MANAGER: VIEW ASSIGNMENTS FOR MY ACCOMMODATIONS ───
  async viewAssignments({ auth, response }: HttpContext) {
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

    return response.ok(assignments)
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