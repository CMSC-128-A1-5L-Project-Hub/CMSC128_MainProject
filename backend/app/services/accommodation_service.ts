import Accommodation from '#models/accommodation'
import Room from '#models/room'
import RoomTag from '#models/room_tag'
import { signImageUrl } from '#services/image_service'

export class AccommodationService {
  async getFilteredCatalog(filters: any = {}) {
    let query = Accommodation.query()
      .where('status', 'verified')
      .preload('images', (q) => {
        q.preload('file')
      })
      .preload('tags')
      .preload('bookmarks')
      .preload('reviews')

    if (filters.dormType) {
      const typeMap: Record<string, string> = {
        'On-Campus': 'on-campus',
        'Off-Campus': 'off-campus',
        'UPLB Partner': 'partner_housing',
      }
      const mapped = typeMap[filters.dormType] || filters.dormType
      query = query.where('accommodationType', mapped)
    }

    if (filters.maxWalk) {
      query = query.where('walkingDistance', '<=', Number(filters.maxWalk))
    }

    let accommodations = await query.limit(50)

    if (accommodations.length === 0) return []

    const accIds = accommodations.map((a) => a.id)
    const allRooms = await Room.query()
      .whereIn('accommodationId', accIds)
      .where('roomAvailability', 'available')
      .preload('tags')
      .orderBy('roomRent', 'asc')

    const roomsByAcc: Record<number, Room[]> = {}
    for (const room of allRooms) {
      if (!roomsByAcc[room.accommodationId]) {
        roomsByAcc[room.accommodationId] = []
      }
      roomsByAcc[room.accommodationId].push(room)
    }

    for (const acc of accommodations) {
      ;(acc as any).rooms = roomsByAcc[acc.id] || []
    }

    const hasRoomFilters =
      filters.roomType || filters.stayType || filters.minPrice || filters.maxPrice

    if (hasRoomFilters) {
      accommodations = accommodations.filter((acc) => {
        const rooms = (acc as any).rooms as Room[]
        if (rooms.length === 0) return false
        return rooms.some((room) => {
          if (filters.roomType && room.roomType !== filters.roomType) return false
          if (filters.stayType && room.roomStayType !== filters.stayType) return false
          if (filters.minPrice && room.roomRent < Number(filters.minPrice)) return false
          if (filters.maxPrice && room.roomRent > Number(filters.maxPrice)) return false
          return true
        })
      })
    }

    const requestedInclusions: string[] =
      filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0
        ? filters.tags
        : []

    if (requestedInclusions.length > 0) {
      accommodations = accommodations.filter((acc) => {
        const rooms = (acc as any).rooms as Room[]
        return rooms.some((room) => {
          const roomInclusions =
            room.tags?.map((t: RoomTag) => t.tagDetail) || []
          return requestedInclusions.every((inc) => roomInclusions.includes(inc))
        })
      })
    }

    const results = await Promise.all(
      accommodations.map(async (acc) => {
        const serialized = acc.serialize() as any
        const rooms = (acc as any).rooms as Room[]
        const primary = acc.images?.[acc.primaryImageIndex || 0]
        serialized.primaryImageUrl = await signImageUrl(primary?.file?.filePath)

        if (rooms.length > 0) {
          const prices = rooms.map((r) => Number(r.roomRent))
          const allInclusions = new Set<string>()
          const roomsByType: Record<string, Room[]> = {}
          const roomTypePricing: Record<string, any> = {}

          for (const room of rooms) {
            if (!roomsByType[room.roomType]) roomsByType[room.roomType] = []
            roomsByType[room.roomType].push(room)
            room.tags?.forEach((tag: RoomTag) => allInclusions.add(tag.tagDetail))
          }

          for (const [type, typeRooms] of Object.entries(roomsByType)) {
            const typePrices = typeRooms.map((r) => Number(r.roomRent))
            const typeInclusions = new Set<string>()
            typeRooms.forEach((r) =>
              r.tags?.forEach((t: RoomTag) => typeInclusions.add(t.tagDetail))
            )
            roomTypePricing[type] = {
              roomCount: typeRooms.length,
              minPrice: Math.min(...typePrices),
              maxPrice: Math.max(...typePrices),
              inclusions: Array.from(typeInclusions),
            }
          }

          serialized.pricing = {
            overallStartingPrice: Math.min(...prices),
            roomTypes: roomTypePricing,
            allInclusions: Array.from(allInclusions),
            totalMatchingRooms: rooms.length,
          }
          serialized.filteredRoomCount = rooms.length
        }

        return serialized
      })
    )

    return results
  }
}