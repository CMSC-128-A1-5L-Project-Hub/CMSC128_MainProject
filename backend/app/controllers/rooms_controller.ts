import type { HttpContext } from '@adonisjs/core/http'
import Room from '#models/room'
import Accommodation from '#models/accommodation'
import db from '@adonisjs/lucid/services/db'

export default class RoomsController {
  
  // ─── MANAGER: VIEW ALL ROOMS IN A DORM ───
  // GET /accommodations/:accommodationId/rooms
  // (Moved from AccommodationController.getRooms)
  async index({ params, response, serialize }: HttpContext) {
    const accommodation = await Accommodation.query().where('id', params.id).first()

    if (!accommodation) {
      return response.notFound({ message: 'Accommodation not found.' })
    }

    const rooms = await Room.query().where('accommodation_id', params.id)
    
    return serialize(rooms)
  }

  // ─── RETRIEVE: BY ID ───
  // GET something
  async show({ params, serialize }: HttpContext) {
    // DB Doc Requirement: Retrieve by ID
  }

  // ─── MANAGER: ADD A NEW ROOM ───
  // POST /accommodations/:accommodationId/rooms
  // (Moved from AccommodationController.addRoom)
  async store({ params, request, auth, response, serialize }: HttpContext) {
    const landlordId = auth.user!.id

    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .where('landlord_id', landlordId)
      .first()

    if (!accommodation) {
      return response.notFound({ message: 'Accommodation not found or does not belong to you.' })
    }

    const body = request.body()

    // Validation
    if (!body.room_number || !body.room_type || !body.room_stay_type || !body.room_capacity || !body.room_building || !body.room_rent || !body.tenant_restriction) {
      return response.badRequest({ message: 'Missing required fields.' })
    }

    if (!['transient', 'non_transient'].includes(body.room_stay_type)) {
      return response.badRequest({ message: 'room_stay_type must be either transient or non_transient.' })
    }

    const trx = await db.transaction()

    try {
      const room = await Room.create({
        accommodationId: accommodation.id,
        roomNumber: body.room_number,
        roomType: body.room_type,
        roomStayType: body.room_stay_type,
        roomCapacity: body.room_capacity,
        roomCurrentOccupancy: 0,
        roomBuilding: body.room_building,
        roomRent: body.room_rent,
        tenantRestriction: body.tenant_restriction,
        roomAvailability: 'available',
      }, { client: trx })

      await trx.commit()

      return serialize({ message: 'Room added successfully.', room_id: room.id })
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({ message: 'Failed to add room.' })
    }
  }

  // ─── MANAGER: UPDATE ROOM DETAILS ───
  // PUT /rooms/:id
  async update({ params, request, serialize }: HttpContext) {
    // Logic: Update capacity, price, or room type. 
    // Guard: Prevent lowering capacity below current_occupancy!
  }

  // ─── MANAGER: DELETE A ROOM ───
  // DELETE /rooms/:id
  async destroy({ params, response, serialize }: HttpContext) {
    // Logic: Check if current_occupancy == 0. 
    // If > 0, return 400 Bad Request. If 0, delete the room.
  }
}