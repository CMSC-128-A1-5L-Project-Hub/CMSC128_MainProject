/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    redirect: typeof routes['auth.redirect']
    callback: typeof routes['auth.callback']
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessToken: {
      store: typeof routes['auth.access_token.store']
      destroy: typeof routes['auth.access_token.destroy']
    }
  }
  setups: {
    show: typeof routes['setups.show']
    store: typeof routes['setups.store']
  }
  studentDashboards: {
    index: typeof routes['student_dashboards.index']
  }
  landlordDashboards: {
    index: typeof routes['landlord_dashboards.index']
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
  }
}
