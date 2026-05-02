import Accommodation from '#models/accommodation'

export class AccommodationService {
  async getFilteredCatalog(filters: any = {}) {
    let query = Accommodation.query()
      .where('status', 'verified')
      .preload('images')
      .preload('tags')
      .preload('bookmarks')
      .preload('reviews')
      .preload('rooms', (roomQuery) => {
        // Apply hard filters to rooms (type, stay type, price range)
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
        // tags are NOT applied here — handled softly in application code
      })

    // Hard requirement: accommodation must have at least one room matching type/stay/price
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

    // Soft tag matching — compute startingPrice and a full-match flag
    const requestedTags: string[] =
      filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0
        ? filters.tags
        : []

    for (const acc of accommodations) {
      const fullyMatchingRooms = requestedTags.length > 0
        ? acc.rooms.filter(room => {
            const roomTagNames = room.tags?.map(t => t.tagDetail) || []
            return requestedTags.every(tag => roomTagNames.includes(tag))
          })
        : acc.rooms

      if (fullyMatchingRooms.length > 0) {
        ;(acc as any).startingPrice = Math.min(...fullyMatchingRooms.map(r => r.roomRent))
        ;(acc as any).tagsFullyMatched = true
      } else {
        if (acc.rooms.length > 0) {
          ;(acc as any).startingPrice = Math.min(...acc.rooms.map(r => r.roomRent))
          ;(acc as any).tagsFullyMatched = false
        } else {
          ;(acc as any).startingPrice = null
          ;(acc as any).tagsFullyMatched = false
        }
      }
    }

    return accommodations
  }
}