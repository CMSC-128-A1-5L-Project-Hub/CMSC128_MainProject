import { DateTime } from 'luxon'
import Application from '#models/application'
import LogService from '#services/log_service'
import { serialize } from 'v8'

export async function checkApplicationDeadline(app: Application, pendingWindowDays = 7) {
  const now = DateTime.now()
  const appDate = app.applicationDate

  const diffInDays = now.diff(appDate, 'days').days

  if (diffInDays > pendingWindowDays && app.applicationStatus === 'pending') {
    app.applicationStatus = 'cancelled'
    await app.save()
    
    await LogService.record(null, 'application', app.id, 'STUDENT_CANCELLED')
  }

  return serialize(app)
}