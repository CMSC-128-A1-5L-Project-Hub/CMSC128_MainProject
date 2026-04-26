// app/controllers/rooms_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import RoomService from '#services/room_service'
import { createRoomValidator, updateRoomValidator } from '#validators/room'
import Room from '#models/room'
import Accommodation from '#models/accommodation'

export default class RoomsController {
  private roomService = new RoomService()

  async index({ params, serialize }: HttpContext) {
    const rooms = await this.roomService.getRoomsByAccommodation(params.id)
    return serialize(rooms)
  }

  async show({ params, serialize }: HttpContext) {
    const room = await this.roomService.getRoomById(params.id)
    return serialize(room)
  }

  async store({ params, request, auth, serialize }: HttpContext) {
    const landlordId = auth.user!.id
    const payload = await createRoomValidator.validate(request.all())
    const room = await this.roomService.createRoom(landlordId, params.id, payload)
    return serialize({ message: 'Room added successfully.', data: room })
  }

  async update({ params, request, response, serialize }: HttpContext) {
    try {
      const payload = await updateRoomValidator.validate(request.all())
      const updatedRoom = await this.roomService.updateRoom(params.id, payload)
      return serialize({ message: 'Room updated successfully.', data: updatedRoom })
    } catch (err) {
      const error = err as Error
      if (error.message === 'CAPACITY_TOO_LOW') {
        return response.badRequest({ message: 'Capacity cannot be lower than current occupancy.' })
      }
      throw error
    }
  }

  async destroy({ params, response, serialize }: HttpContext) {
    try {
      await this.roomService.deleteRoom(params.id)
      return serialize({ message: 'Room deleted successfully.' })
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
    return response.ok({ status: 200, data: { total: Number(availableRooms[0].$extras.total) } })
  }

  // ─── MANAGER: ALL ROOMS UNDER MY ACCOMMODATIONS ───
  async managerRooms({ auth, serialize }: HttpContext) {
    const user = auth.user!
    const accommodations = await Accommodation.query().where('managerId', user.id)
    const accIds = accommodations.map(a => a.id)
    if (accIds.length === 0) return serialize([])

    const rooms = await Room.query()
      .whereIn('accommodationId', accIds)
      .preload('accommodation')
      .preload('tags')   // preload tags for dashboard filtering if needed

    return serialize(rooms)
  }
}