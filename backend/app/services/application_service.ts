import Application from '#models/application'
import { withPrimaryImageUrl } from './image_service.ts'

export default class ApplicationService {
  
  /**
   * Main entry point: Fetches and formats all applications for a student
   */
  async getFormattedApplications(studentNumber: string) {
    const applications = await Application.query()
      .where('studentNumber', studentNumber)
      .preload('accommodation', (q) => {
        q.preload('rooms', (q) => q.preload('tags'))
        q.preload('images', (q) => q.preload('file'))
      })
      .orderBy('applicationDate', 'desc')

    return Promise.all(applications.map(app => this.formatApplication(app)))
  }

  /**
   * Helper 1: Serializes a single application and attaches the extra data
   */
  private async formatApplication(app: Application) {
    const serialized = app.serialize() as any
    
    // Abstract the ugly math away!
    serialized.estimatedMonthlyRent = this.calculateCheapestRent(app)

    if (app.accommodation) {
      serialized.accommodation = await withPrimaryImageUrl(app.accommodation)
    }

    return serialized
  }

  /**
   * Helper 2: Simplified Rent Math Logic
   */
  private calculateCheapestRent(app: Application): number | null {
    const rooms = app.accommodation?.rooms
    if (!rooms || rooms.length === 0) return null

    // Fallback safely to empty arrays if preferences don't exist
    const preferredTags: string[] = (app as any).preferredTags ?? []

    // 1. Filter out rooms that don't match criteria
    const validRooms = rooms.filter((room) => {
      // Fast fails
      if (room.roomType !== app.applicationRoomType) return false
      if (room.roomStayType !== app.applicationStayType) return false

      // Check tags (only if the student specified preferences)
      if (preferredTags.length > 0) {
        const roomTags = room.tags?.map(t => t.tagDetail) ?? []
        const hasAllTags = preferredTags.every(tag => roomTags.includes(tag))
        if (!hasAllTags) return false
      }

      return true
    })

    // 2. Return the lowest rent, or null if no rooms matched
    if (validRooms.length === 0) return null
    return Math.min(...validRooms.map(r => r.roomRent))
  }
}