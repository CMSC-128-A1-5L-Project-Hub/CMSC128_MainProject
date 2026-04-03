import type { HttpContext } from '@adonisjs/core/http'
import RoomService from '#services/room_services'
import { createRoomValidator, updateRoomValidator } from '#validators/room'

export default class RoomsController {
  private roomService = new RoomService()

  // ─── MANAGER: VIEW ALL ROOMS IN A DORM ───
  async index({ params, serialize }: HttpContext) {
    const rooms = await this.roomService.getRoomsByAccommodation(params.id)
    return serialize(rooms)
  }

  // ─── RETRIEVE: BY ID ───
  async show({ params, serialize }: HttpContext) {
    const room = await this.roomService.getRoomById(params.id)
    return serialize(room)
  }

  // ─── MANAGER: ADD A NEW ROOM ───
  async store({ params, request, auth, serialize }: HttpContext) {
    const landlordId = auth.user!.id
    
    const payload = await createRoomValidator.validate(request.all())

    const room = await this.roomService.createRoom(landlordId, params.id, payload)

    return serialize({ 
      message: 'Room added successfully.', 
      data: room 
    })
  }

  // ─── MANAGER: UPDATE ROOM DETAILS ───
  async update({ params, request, response, serialize }: HttpContext) {
    try {
      const payload = await updateRoomValidator.validate(request.all())
      const updatedRoom = await this.roomService.updateRoom(params.id, payload)

      return serialize({
        message: 'Room updated successfully.',
        data: updatedRoom
      })
    } catch (error) {

      if (error.message === 'CAPACITY_TOO_LOW') {
        return response.badRequest({ message: 'Capacity cannot be lower than current occupancy.' })
      }
      throw error // Let Adonis handle 404s and validation errors
    }
  }

  // ─── MANAGER: DELETE A ROOM ───
  async destroy({ params, response, serialize }: HttpContext) {
    try {
      await this.roomService.deleteRoom(params.id)
      
      return serialize({ message: 'Room deleted successfully.' })
    } catch (error) {

      if (error.message === 'ROOM_OCCUPIED') {
        return response.badRequest({ message: 'Cannot delete a room that currently has tenants.' })
      }
      throw error
    }
  }
}