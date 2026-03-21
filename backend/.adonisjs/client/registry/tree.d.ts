/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    redirect: typeof routes['auth.redirect']
    callback: typeof routes['auth.callback']
  }
  studentDashboards: {
    index: typeof routes['student_dashboards.index']
  }
  landlordDashboards: {
    index: typeof routes['landlord_dashboards.index']
  }
  setups: {
    store: typeof routes['setups.store']
  }
  adminVerifications: {
    index: typeof routes['admin_verifications.index']
    verify: typeof routes['admin_verifications.verify']
  }
  application: {
    incoming: typeof routes['application.incoming']
    updateStatus: typeof routes['application.update_status']
  }
}
