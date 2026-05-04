import Accommodation from '#models/accommodation'
import Room from '#models/room'
import RoomTag from '#models/room_tag'


export class AccommodationService {
  async getFilteredCatalog(filters: any = {}) {
    let query = Accommodation.query()
      .where('status', 'verified')
      .preload('images')
      .preload('tags')
      .preload('bookmarks')
      .preload('reviews')
      .preload('rooms', (roomQuery) => {
        // Preload tags for filtering
        roomQuery.preload('tags')
        
        // Apply room type filter
        if (filters.roomType) {
          roomQuery.where('roomType', filters.roomType)
        }
        
        // Apply stay type filter
        if (filters.stayType) {
          roomQuery.where('roomStayType', filters.stayType)
        }
        
        // Apply price range filters
        if (filters.minPrice) {
          roomQuery.where('roomRent', '>=', filters.minPrice)
        }
        if (filters.maxPrice) {
          roomQuery.where('roomRent', '<=', filters.maxPrice)
        }
        
        // Order cheapest first
        roomQuery.orderBy('roomRent', 'asc')
      })

    // Ensure accommodation has at least one room matching type/stay/price
    if (filters.roomType || filters.stayType || filters.minPrice || filters.maxPrice) {
      query = query.whereHas('rooms', (roomQuery) => {
        if (filters.roomType) roomQuery.where('roomType', filters.roomType)
        if (filters.stayType) roomQuery.where('roomStayType', filters.stayType)
        if (filters.minPrice) roomQuery.where('roomRent', '>=', filters.minPrice)
        if (filters.maxPrice) roomQuery.where('roomRent', '<=', filters.maxPrice)
      })
    }

    // Accommodation-level filters
    if (filters.dormType) {
      query = query.where('accommodationType', filters.dormType)
    }
    if (filters.maxWalk) {
      query = query.where('walkingDistance', '<=', filters.maxWalk)
    }

    const accommodations = await query

    // Parse requested inclusions/tags
    const requestedInclusions: string[] =
      filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0
        ? filters.tags
        : []

    // Process each accommodation
    for (const acc of accommodations) {
      // Filter rooms by inclusions if requested
      let filteredRooms: Room[] = acc.rooms ?? []
      
      if (requestedInclusions.length > 0) {
        filteredRooms = acc.rooms.filter(room => {
          const roomInclusions = room.tags?.map((t: RoomTag) => t.tagDetail) || []
          return requestedInclusions.every(inclusion => roomInclusions.includes(inclusion))
        })
      }

      // Group by room type for pricing breakdown
      const roomsByType: Record<string, Room[]> = {}
      const allInclusions = new Set<string>()
      
      for (const room of filteredRooms) {
        if (!roomsByType[room.roomType]) {
          roomsByType[room.roomType] = []
        }
        roomsByType[room.roomType].push(room)
        
        room.tags?.forEach((tag: RoomTag) => allInclusions.add(tag.tagDetail))
      }

      // Calculate pricing per room type
      const roomTypePricing: Record<string, any> = {}

      for (const [type, rooms] of Object.entries(roomsByType)) {
        const prices = rooms.map((r: Room) => Number(r.roomRent))
        const typeInclusions = new Set<string>()

        rooms.forEach((room: Room) => {
          room.tags?.forEach((tag: RoomTag) => typeInclusions.add(tag.tagDetail))
        })

        roomTypePricing[type] = {
          roomCount: rooms.length,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          inclusions: Array.from(typeInclusions),
        }
      }

      // Overall pricing
      const allPrices = filteredRooms.map(r => r.roomRent)
      const overallStartingPrice = allPrices.length > 0 ? Math.min(...allPrices) : null

      // Attach all metadata to accommodation
      ;(acc as any).pricing = {
        overallStartingPrice,
        roomTypes: roomTypePricing,
        allInclusions: Array.from(allInclusions),
        hasFilters: requestedInclusions.length > 0,
        requestedInclusions,
        matchesFound: filteredRooms.length > 0,
        totalMatchingRooms: filteredRooms.length
      }

      // Include ALL rooms for detail view, but mark which ones match
      ;(acc as any).filteredRoomCount = filteredRooms.length
    }

    return accommodations
  }
}