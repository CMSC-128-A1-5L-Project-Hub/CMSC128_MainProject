import Log from '#models/log'

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
}
