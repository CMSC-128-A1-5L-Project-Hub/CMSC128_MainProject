import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import RoomService from '#services/room_service'
import { createRoomValidator, updateRoomValidator } from '#validators/room'
import Room from '#models/room'
import Accommodation from '#models/accommodation'
import RoomIssue from '#models/room_issue'
import LogService from '#services/log_service'
import NotificationService from '#services/notification_service'
import { DateTime } from 'luxon'

@inject()
export default class RoomsController {
  constructor(
    protected roomService: RoomService,
    protected notificationService: NotificationService
  ) {}

  // ─── MANAGER: VIEW ALL ROOMS IN A DORM ───
  async index({ params, auth, response }: HttpContext) {
    const userId = auth.user!.id
    await Accommodation.query()
      .where('id', params.accommodationId)
      .where((q) => q.where('landlord_id', userId).orWhere('manager_id', userId))
      .firstOrFail()
    const rooms = await this.roomService.getRoomsByAccommodation(params.accommodationId)
    return response.ok(rooms)
  }

  // ─── RETRIEVE: BY ID ───
  async show({ params, response }: HttpContext) {
    const room = await this.roomService.getRoomById(params.id)
    return response.ok(room)
  }

  // ─── MANAGER: ADD A NEW ROOM ───
  async store({ params, request, auth, response }: HttpContext) {
    const landlordId = auth.user!.id
    const payload = await createRoomValidator.validate(request.all())
    const room = await this.roomService.createRoom(landlordId, params.accommodationId, payload)

    try {
      await LogService.record(
        landlordId,
        'room',
        room.id,
        'ROOM_CREATED',
        `Room ${room.roomNumber} (building ${room.roomBuilding}) added to Accommodation ${params.accommodationId}`
      )
    } catch (e) {
      console.error('Failed to log ROOM_CREATED:', e)
    }

    return response.ok(room)
  }

  // ─── MANAGER: UPDATE ROOM DETAILS ───
  async update({ params, request, auth, response }: HttpContext) {
    try {
      const payload = await updateRoomValidator.validate(request.all())
      const updatedRoom = await this.roomService.updateRoom(params.id, payload, auth.user!.id)

      try {
        await LogService.record(
          auth.user!.id,
          'room',
          updatedRoom.id,
          'ROOM_UPDATED',
          `Room ${updatedRoom.roomNumber} (building ${updatedRoom.roomBuilding}) updated`
        )
      } catch (e) {
        console.error('Failed to log ROOM_UPDATED:', e)
      }

      return response.ok(updatedRoom)
    } catch (err) {
      const error = err as Error
      if (error.message === 'CAPACITY_TOO_LOW') {
        return response.badRequest({ message: 'Capacity cannot be lower than current occupancy.' })
      }
      throw error
    }
  }

  // ─── MANAGER: DELETE A ROOM ───
  async destroy({ params, auth, response }: HttpContext) {
    try {
      const roomBeforeDelete = await Room.find(params.id)
      await this.roomService.deleteRoom(params.id, auth.user!.id)

      try {
        await LogService.record(
          auth.user!.id,
          'room',
          Number(params.id),
          'ROOM_DELETED',
          roomBeforeDelete
            ? `Room ${roomBeforeDelete.roomNumber} (building ${roomBeforeDelete.roomBuilding}) deleted from Accommodation ${roomBeforeDelete.accommodationId}`
            : `Room ${params.id} deleted`
        )
      } catch (e) {
        console.error('Failed to log ROOM_DELETED:', e)
      }

      return response.ok({ message: 'Room deleted successfully.' })
    } catch (err) {
      const error = err as Error
      if (error.message === 'ROOM_OCCUPIED') {
        return response.badRequest({ message: 'Cannot delete a room that has tenants.' })
      }
      throw error
    }
  }

  async countAvailableRooms({ response }: HttpContext) {
    const availableRooms = await Room.query()
      .where('roomAvailability', 'available')
      .count('* as total')
    return response.ok({ total: Number(availableRooms[0].$extras.total) })
  }

  // ─── MANAGER/LANDLORD: GET ROOMS WITH OCCUPANTS (FIXED FOR BOTH) ───
  async managerRooms({ auth, response }: HttpContext) {
    const user = auth.user!
    const userRole = user.role
    
    // Build query based on user role
    let accommodationsQuery = Accommodation.query()
    
    if (userRole === 'manager') {
      accommodationsQuery = accommodationsQuery.where('managerId', user.id)
    } else if (userRole === 'landlord') {
      accommodationsQuery = accommodationsQuery.where('landlordId', user.id)
    } else {
      return response.forbidden({ message: 'Access denied' })
    }
    
    const accommodations = await accommodationsQuery
    const accIds = accommodations.map(a => a.id)
    if (accIds.length === 0) return response.ok([])

    const rooms = await Room.query()
      .whereIn('accommodationId', accIds)
      .preload('accommodation')
      .preload('tags')
      .preload('assignments', (assignmentQuery) => {
        assignmentQuery
          .whereNull('actualMoveOut')
          .where('confirmationStatus', 'active')
          .preload('student', (studentQuery) => {
            studentQuery.preload('user')
          })
      })

    // Transform the rooms to include occupants data for the frontend
    const transformedRooms = rooms.map(room => {
      const occupants = room.assignments
        .filter(assignment => assignment.confirmationStatus === 'active')
        .map(assignment => ({
          id: assignment.id,
          name: `${assignment.student.user.fname} ${assignment.student.user.lname}`,
          email: assignment.student.user.email,
          studentNumber: assignment.studentNumber,
          moveIn: assignment.moveIn,
          expectedMoveOut: assignment.expectedMoveOut,
        }))

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        roomBuilding: room.roomBuilding,
        roomType: room.roomType,
        roomCapacity: room.roomCapacity,
        roomCurrentOccupancy: room.roomCurrentOccupancy,
        roomRent: room.roomRent,
        roomAvailability: room.roomAvailability,
        roomStayType: room.roomStayType,
        tenantRestriction: room.tenantRestriction,
        occupants: occupants,
        tags: room.tags,
        accommodation: room.accommodation,
      }
    })

    return response.ok(transformedRooms)
  }

  async reportIssue({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const room = await Room.findOrFail(params.id)
    const { issueDetails } = request.body()

    if (!issueDetails) {
      return response.badRequest({ message: 'Issue details are required' })
    }

    await LogService.record(
      user.id,
      'room',
      room.id,
      'ROOM_ISSUE_REPORTED',
      `Manager reported issue for room ${room.roomNumber} (building ${room.roomBuilding}): ${issueDetails}`
    )

    const reporterRole: 'student' | 'manager' = user.role === 'student' ? 'student' : 'manager'
    await RoomIssue.create({
      roomId: room.id,
      reporterId: user.id,
      reporterRole,
      issueDetails,
      status: 'open',
    })

    await room.load('accommodation', (q) =>
      q.preload('landlord', (l) => l.preload('user'))
    )
    const landlord = room.accommodation?.landlord

    if (landlord?.user) {
      await this.notificationService.sendRoomIssueReportEmail(
        landlord.user,
        room.roomNumber,
        room.roomBuilding,
        user.fname,
        user.lname,
        issueDetails
      )

      try {
        await this.notificationService.notify(
          landlord.user.id,
          'other',
          `New issue reported for Room ${room.roomNumber} at ${room.accommodation?.accommodationName ?? ''}.`
        )
      } catch (e) {
        console.error('[notify] in-app room-issue controller-wrap failed:', e)
      }
    }

    return response.ok({ message: 'Issue reported successfully' })
  }

  // ─── LANDLORD: LIST OPEN ROOM ISSUES ───
  // GET /landlord/room-issues
  async listIssues({ auth, response }: HttpContext) {
    const user = auth.user!
    const accommodations = await Accommodation.query().where('landlordId', user.id)
    const accIds = accommodations.map((a) => a.id)
    if (accIds.length === 0) return response.ok([])

    const rooms = await Room.query().whereIn('accommodationId', accIds)
    const roomIds = rooms.map((r) => r.id)
    if (roomIds.length === 0) return response.ok([])

    const issues = await RoomIssue.query()
      .whereIn('roomId', roomIds)
      .where('status', 'open')
      .preload('room', (q) => q.preload('accommodation'))
      .preload('reporter')
      .orderBy('createdAt', 'desc')

    return response.ok(issues)
  }

  // ─── LANDLORD: RESOLVE A ROOM ISSUE ───
  // PATCH /room-issues/:id/resolve
  async resolveIssue({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const issue = await RoomIssue.query()
      .where('id', params.id)
      .preload('room', (q) => q.preload('accommodation'))
      .firstOrFail()

    if (issue.room.accommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own this accommodation' })
    }

    if (issue.status === 'resolved') {
      return response.badRequest({ message: 'Issue already resolved' })
    }

    issue.status = 'resolved'
    issue.resolvedBy = user.id
    issue.resolvedAt = DateTime.now()
    await issue.save()

    await LogService.record(
      user.id,
      'room',
      issue.roomId,
      'ROOM_ISSUE_RESOLVED',
      `Landlord resolved issue ${issue.id} for room ${issue.room.roomNumber}`
    )

    return response.ok(issue)
  }
}