/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    redirect: typeof routes['auth.redirect']
    callback: typeof routes['auth.callback']
    me: typeof routes['auth.me']
  }
  accommodation: {
    index: typeof routes['accommodation.index']
    show: typeof routes['accommodation.show']
  }
  setups: {
    show: typeof routes['setups.show']
    store: typeof routes['setups.store']
  }
  reports: {
    revenue: typeof routes['reports.revenue']
    delinquency: typeof routes['reports.delinquency']
    occupancy: typeof routes['reports.occupancy']
    applicationTrends: typeof routes['reports.application_trends']
  }
  application: {
    incoming: typeof routes['application.incoming']
    updateStatus: typeof routes['application.update_status']
  }
  adminVerifications: {
    index: typeof routes['admin_verifications.index']
    verify: typeof routes['admin_verifications.verify']
  }
  adminSettings: {
    index: typeof routes['admin_settings.index']
    update: typeof routes['admin_settings.update']
  }
  logs: {
    index: typeof routes['logs.index']
  }
}
