import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import RoomService from '#services/room_service'
import { createRoomValidator, updateRoomValidator } from '#validators/room'
import Room from '#models/room'
import Accommodation from '#models/accommodation'
import LogService from '#services/log_service'
import NotificationService from '#services/notification_service'

@inject()
export default class RoomsController {
  constructor(
    protected roomService: RoomService,
    protected notificationService: NotificationService
  ) {}

  // ─── MANAGER: VIEW ALL ROOMS IN A DORM ───
  async index({ params, response }: HttpContext) {
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
    return response.ok(room)
  }

  // ─── MANAGER: UPDATE ROOM DETAILS ───
  async update({ params, request, response }: HttpContext) {
    try {
      const payload = await updateRoomValidator.validate(request.all())
      const updatedRoom = await this.roomService.updateRoom(params.id, payload)
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
  async destroy({ params, response }: HttpContext) {
    try {
      await this.roomService.deleteRoom(params.id)
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

  async managerRooms({ auth, response }: HttpContext) {
    const user = auth.user!
    const accommodations = await Accommodation.query().where('managerId', user.id)
    const accIds = accommodations.map(a => a.id)
    if (accIds.length === 0) return response.ok([])

    const rooms = await Room.query()
      .whereIn('accommodationId', accIds)
      .preload('accommodation')
      .preload('tags')

    return response.ok(rooms)
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
    }

    return response.ok({ message: 'Issue reported successfully' })
  }
}
