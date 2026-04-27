import { DateTime } from 'luxon'
import Application from '#models/application'
import LogService from '#services/log_service'
import WaitlistWorkflowService from '#services/waitlisted_workflow_service'
import appService from '@adonisjs/core/services/app'

export async function checkApplicationDeadline(
  application: Application,
  pendingWindowDays = 7,
  confirmedWindowDays = 3
) {
  const now = DateTime.now()

  // 1. Expire old pending applications
  if (application.applicationStatus === 'pending') {
    const diffDays = now.diff(application.applicationDate, 'days').days
    if (diffDays > pendingWindowDays) {
      application.applicationStatus = 'cancelled'
      await application.save()
      await LogService.record(null, 'application', application.id, 'AUTO_CANCELLED_PENDING')
      return
    }
  }

  // 2. Expire approved (unconfirmed) applications after the confirmation window
  if (application.applicationStatus === 'approved') {
    const referenceDate = application.approvedAt ?? application.applicationDate
    const daysSinceApproval = now.diff(referenceDate, 'days').days

    if (daysSinceApproval > confirmedWindowDays) {
      const wlService = await appService.container.make(WaitlistWorkflowService)
      await wlService.processSlotExpiry(application.id)
    }
  }
}
