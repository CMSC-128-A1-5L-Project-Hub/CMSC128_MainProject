// app/controllers/assignments_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'
import Room from '#models/room'
import Accommodation from '#models/accommodation'
import Application from '#models/application'   // <-- ADD THIS
import LogService from '#services/log_service'
import { DateTime } from 'luxon'

export default class AssignmentsController {

  // ─── MANAGER: ASSIGN A ROOM (after student confirmed) ───
  async store({ auth, request, response, serialize }: HttpContext) {
    const user = auth.user!
    const { studentNumber, roomId, moveIn, expectedMoveOut } = request.body()
    if (!studentNumber || !roomId || !moveIn || !expectedMoveOut) {
      return response.badRequest({ message: 'studentNumber, roomId, moveIn, expectedMoveOut required' })
    }

    const room = await Room.query()
      .where('id', roomId)
      .preload('accommodation')
      .firstOrFail()

    if (room.accommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage this room' })
    }
    if (room.roomCurrentOccupancy >= room.roomCapacity) {
      return response.badRequest({ message: 'Room is already full' })
    }

    // Check the student has a CONFIRMED application for this accommodation
    const application = await Application.query()
      .where('studentNumber', studentNumber)
      .where('accommodationId', room.accommodationId)
      .where('applicationStatus', 'confirmed')
      .first()

    if (!application) {
      return response.badRequest({ message: 'Student has no confirmed application for this accommodation' })
    }
    if (application.applicationRoomType !== room.roomType) {
      return response.badRequest({ message: 'Room type does not match application' })
    }
    if (application.applicationStayType !== room.roomStayType) {
      return response.badRequest({ message: 'Stay type does not match application' })
    }

    // Prevent double assignment
    const existing = await Assignment.query()
      .where('studentNumber', studentNumber)
      .whereNull('actualMoveOut')
      .first()
    if (existing) {
      return response.conflict({ message: 'Student already has an active assignment' })
    }

    const assignment = await Assignment.create({
      studentNumber,
      roomId,
      moveIn: DateTime.fromISO(moveIn),
      expectedMoveOut: DateTime.fromISO(expectedMoveOut),
      confirmedDate: DateTime.now(),
      gracePeriodDays: 5,
      actualMoveOut: null,
    })

    // Update room occupancy
    room.roomCurrentOccupancy += 1
    if (room.roomCurrentOccupancy === room.roomCapacity) {
      room.roomAvailability = 'occupied'
    }
    await room.save()

    await LogService.record(user.id, 'assignment', assignment.id,
      'MANAGER_ASSIGNED_ROOM', `Student ${studentNumber} assigned to room ${room.roomNumber}`)

    return serialize(assignment)
  }

  // ─── MOVE OUT (to be implemented later) ───
  /*
  async moveOut({ params, request, response, serialize }: HttpContext) {
    // ...
  }

  async index({ request, serialize }: HttpContext) {
    // ...
  }

  async currentStay({ auth, serialize }: HttpContext) {
    // ...
  }

  async stayHistory({ auth, serialize }: HttpContext) {
    // ...
  }

  
  */

   /*Remove this na lang and uncomment ung sa taas */
  async moveOut(ctx: HttpContext) {
    // ...
  }
  async index(ctx: HttpContext) {
      // ...
  }
  async currentStay(ctx: HttpContext) {
      // ...
  }
  async stayHistory(ctx: HttpContext) {
      // ...
  }

  // ─── MANAGER: GET ALL ASSIGNMENTS FOR DASHBOARD ───
  async managerIndex({ auth, serialize }: HttpContext) {
    const user = auth.user!
    const accommodations = await Accommodation.query()
      .where('managerId', user.id)
    const accIds = accommodations.map(a => a.id)
    if (accIds.length === 0) return serialize([])

    const rooms = await Room.query()
      .whereIn('accommodationId', accIds)
    const roomIds = rooms.map(r => r.id)

    const assignments = await Assignment.query()
      .whereIn('roomId', roomIds)
      .preload('room', (q) => q.preload('accommodation'))
      .preload('student', (q) => q.preload('user'))
      .orderBy('moveIn', 'asc')

    return serialize(assignments)
  }
}