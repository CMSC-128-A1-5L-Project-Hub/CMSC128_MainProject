import Room from '#models/room'
import Accommodation from '#models/accommodation'

export default class RoomService {
  
  // ─── FETCH ALL ROOMS IN ACCOMMODATION ───
  async getRoomsByAccommodation(accommodationId: number) {
    // Check if accommodation exists first
    await Accommodation.findOrFail(accommodationId)
    return await Room.query().where('accommodationId', accommodationId)
  }

  // ─── FETCH SINGLE ROOM ───
  async getRoomById(roomId: number) {
    return await Room.query().where('id', roomId).preload('accommodation').firstOrFail()
  }

  // ─── CREATE NEW ROOM ───
  async createRoom(landlordId: number, accommodationId: number, payload: any) {
    // 1. Verify the accommodation exists AND belongs to this specific landlord
    const accommodation = await Accommodation.query()
      .where('id', accommodationId)
      .where('landlordId', landlordId)
      .firstOrFail() // Automatically throws 404 if they don't own it

    // 2. Create the room
    const room = await Room.create({
      accommodationId: accommodation.id,
      roomNumber: payload.room_number,
      roomType: payload.room_type,
      roomStayType: payload.room_stay_type,
      roomCapacity: payload.room_capacity,
      roomCurrentOccupancy: 0, // Always starts at 0
      roomBuilding: payload.room_building,
      roomRent: payload.room_rent,
      tenantRestriction: payload.tenant_restriction,
      roomAvailability: 'available', // Always starts available
    })

    return room
  }

  // ─── UPDATE ROOM ───
  async updateRoom(id: number, payload: any) {
    const room = await Room.findOrFail(id)
    
    // Guard: Prevent ghost tenants!
    if (payload.room_capacity !== undefined && payload.room_capacity < room.roomCurrentOccupancy) {
      throw new Error('CAPACITY_TOO_LOW') 
    }

    // Auto-map the new values
    room.merge(payload)

    // Auto-update availability status
    if (room.roomCapacity === room.roomCurrentOccupancy) {
      room.roomAvailability = 'occupied'
    }

    await room.save()
    return room
  }

  // ─── DELETE ROOM ───
  async deleteRoom(id: number) {
    const room = await Room.findOrFail(id)

    // Guard: Prevent deleting a room with students in it
    if (room.roomCurrentOccupancy > 0) {
        throw new Error('ROOM_OCCUPIED')
    }

    await room.delete()
  }
}