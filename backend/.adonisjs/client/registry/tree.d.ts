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
    landlordIndex: typeof routes['accommodation.landlord_index']
    store: typeof routes['accommodation.store']
    update: typeof routes['accommodation.update']
    uploadImages: typeof routes['accommodation.upload_images']
    deleteImage: typeof routes['accommodation.delete_image']
  }
  setups: {
    show: typeof routes['setups.show']
    store: typeof routes['setups.store']
  }
  application: {
    store: typeof routes['application.store']
    index: typeof routes['application.index']
    incoming: typeof routes['application.incoming']
    updateStatus: typeof routes['application.update_status']
  }
  assignments: {
    currentStay: typeof routes['assignments.current_stay']
    stayHistory: typeof routes['assignments.stay_history']
    store: typeof routes['assignments.store']
    moveOut: typeof routes['assignments.move_out']
  }
  bookmark: {
    toggle: typeof routes['bookmark.toggle']
    index: typeof routes['bookmark.index']
  }
  reviews: {
    store: typeof routes['reviews.store']
  }
  fees: {
    index: typeof routes['fees.index']
  }
  payments: {
    uploadProof: typeof routes['payments.upload_proof']
    pending: typeof routes['payments.pending']
    verify: typeof routes['payments.verify']
  }
  reports: {
    revenue: typeof routes['reports.revenue']
    delinquency: typeof routes['reports.delinquency']
    occupancy: typeof routes['reports.occupancy']
    applicationTrends: typeof routes['reports.application_trends']
  }
  managerHandover: {
    freeze: typeof routes['manager_handover.freeze']
    unfreeze: typeof routes['manager_handover.unfreeze']
    status: typeof routes['manager_handover.status']
  }
  inviteManager: {
    invite: typeof routes['invite_manager.invite']
  }
  rooms: {
    index: typeof routes['rooms.index']
    store: typeof routes['rooms.store']
    update: typeof routes['rooms.update']
    destroy: typeof routes['rooms.destroy']
    countAvailableRooms: typeof routes['rooms.count_available_rooms']
  }
  adminVerifications: {
    index: typeof routes['admin_verifications.index']
    verify: typeof routes['admin_verifications.verify']
  }
  adminSettings: {
    index: typeof routes['admin_settings.index']
    update: typeof routes['admin_settings.update']
    countUsers: typeof routes['admin_settings.count_users']
  }
  logs: {
    index: typeof routes['logs.index']
  }
}
