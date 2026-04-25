// app/services/room_service.ts
import Room from '#models/room'
import Accommodation from '#models/accommodation'
import RoomTag from '#models/room_tag'

export default class RoomService {
  
  async getRoomsByAccommodation(accommodationId: number) {
    await Accommodation.findOrFail(accommodationId)
    return await Room.query().where('accommodationId', accommodationId)
  }

  async getRoomById(roomId: number) {
    return await Room.query().where('id', roomId).preload('accommodation').firstOrFail()
  }

  async createRoom(landlordId: number, accommodationId: number, payload: any) {
    const accommodation = await Accommodation.query()
      .where('id', accommodationId)
      .where('landlordId', landlordId)
      .firstOrFail()

    const room = await Room.create({
      accommodationId: accommodation.id,
      roomNumber: payload.room_number,
      roomType: payload.room_type,
      roomStayType: payload.room_stay_type,
      roomCapacity: payload.room_capacity,
      roomCurrentOccupancy: 0,
      roomBuilding: payload.room_building,
      roomRent: payload.room_rent,
      tenantRestriction: payload.tenant_restriction,
      roomAvailability: 'available',
    })

    // Create tags if provided
    if (payload.tags && Array.isArray(payload.tags)) {
      await Promise.all(
        payload.tags.map((tag: string) =>
          RoomTag.create({ roomId: room.id, tagDetail: tag })
        )
      )
    }

    return room
  }

  async updateRoom(id: number, payload: any) {
    const room = await Room.findOrFail(id)

    if (payload.room_capacity !== undefined && payload.room_capacity < room.roomCurrentOccupancy) {
      throw new Error('CAPACITY_TOO_LOW')
    }

    // Extract tags from the payload before merging
    const { tags, ...roomData } = payload
    room.merge(roomData)

    // If tags are provided, replace all existing tags with the new list
    if (tags !== undefined) {
      // Delete old tags
      await RoomTag.query().where('roomId', room.id).delete()
      // Create new ones
      if (Array.isArray(tags) && tags.length > 0) {
        await Promise.all(
          tags.map((tag: string) =>
            RoomTag.create({ roomId: room.id, tagDetail: tag })
          )
        )
      }
    }

    // Update availability status based on capacity vs occupancy
    if (room.roomCapacity === room.roomCurrentOccupancy) {
      room.roomAvailability = 'occupied'
    }
    await room.save()

    return room
  }

  async deleteRoom(id: number) {
    const room = await Room.findOrFail(id)
    if (room.roomCurrentOccupancy > 0) {
      throw new Error('ROOM_OCCUPIED')
    }
    await room.delete()
  }
}