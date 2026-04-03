import Log from '#models/log'
import { DateTime } from 'luxon'

export default class LogService {
  static async record(
    actorId: number | null,
    entityType:
      | 'application'
      | 'assignment'
      | 'payment'
      | 'room'
      | 'accommodation'
      | 'document'
      | 'report'
      | 'fee',
    entityId: number,
    activityType: string,
    activityDetails: string | null = null
  ) {
    await Log.create({
      actorId,
      entityType,
      entityId,
      activityType,
      activityDetails,
    })
  }

  static async recordApplication(actorId: number, actorRole: string, accommodationId: number) {
    const timestamp = DateTime.now().toFormat('yyyy-MM-dd')
    const roleLabel = actorRole.charAt(0).toUpperCase() + actorRole.slice(1)
    const activityDetails = `${timestamp} - ${roleLabel} ${actorId} applied for Accommodation ${accommodationId}`

    await this.record(
      actorId,
      'application',
      accommodationId,
      'application_submitted',
      activityDetails
    )
  }
}
