import Accommodation from '#models/accommodation'

export class AccommodationService {
  async getFilteredCatalog(filters: any = {}) {
    // 1. Base Query: Only show verified accommodations
    let query = Accommodation.query()
      .where('status', 'verified')
      .preload('images')
      .preload('rooms')

    // 2. Direct Accommodation Filters
    if (filters.dormType) {
      query = query.where('accommodationType', filters.dormType)
    }

    if (filters.maxWalk) {
      query = query.where('walkingDistance', '<=', filters.maxWalk)
    }

    // 3. Tag Filters
    // If they selected ['wifi', 'air-con'], the dorm MUST have both.
    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
      filters.tags.forEach((tag: string) => {
        query = query.whereHas('tags', (tagQuery) => {
          tagQuery.where('tagDetail', tag)
        })
      })
    }

    // 4. Room Filters
    // Only return dorms that have AT LEAST ONE room matching ALL the room criteria
    if (filters.roomType || filters.stayType || filters.minPrice || filters.maxPrice) {
      query = query.whereHas('rooms', (roomQuery) => {
        
        // We only care about available rooms!
        roomQuery.where('roomAvailability', 'available')

        if (filters.roomType) {
          roomQuery.where('roomType', filters.roomType)
        }
        if (filters.stayType) {
          roomQuery.where('roomStayType', filters.stayType)
        }
        if (filters.minPrice) {
          roomQuery.where('roomRent', '>=', filters.minPrice)
        }
        if (filters.maxPrice) {
          roomQuery.where('roomRent', '<=', filters.maxPrice)
        }
      })
    }

    // Execute and return!
    return await query
  }
}