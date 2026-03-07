import Log from '#models/log'
import { DateTime } from 'luxon' // Import time for timestamp

export default class LogService {
  // Make the function 'record' here. record creates the Log
  // This makes the log entry in the database
  static async record(
    actorId: number | null,
    entityType: string,
    entityId: number,
    activityType: string,
    activityDetails: string | null = null
  ) {
    //Create new log record in the database
    await Log.create({
      actorId: actorId,
      entityType: entityType,
      entityId: entityId,
      timestamp: DateTime.now(),
      activityType: activityType,
      activityDetails: activityDetails,
    })
  }
}
