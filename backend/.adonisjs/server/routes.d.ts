import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'accommodation.index': { paramsTuple?: []; params?: {} }
    'accommodation.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'setups.show': { paramsTuple?: []; params?: {} }
    'setups.store': { paramsTuple?: []; params?: {} }
    'application.store': { paramsTuple?: []; params?: {} }
    'application.index': { paramsTuple?: []; params?: {} }
    'assignments.current_stay': { paramsTuple?: []; params?: {} }
    'assignments.stay_history': { paramsTuple?: []; params?: {} }
    'bookmark.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookmark.index': { paramsTuple?: []; params?: {} }
    'reviews.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fees.index': { paramsTuple?: []; params?: {} }
    'payments.upload_proof': { paramsTuple: [ParamValue]; params: {'feeId': ParamValue} }
    'reports.revenue': { paramsTuple?: []; params?: {} }
    'reports.delinquency': { paramsTuple?: []; params?: {} }
    'accommodation.landlord_index': { paramsTuple?: []; params?: {} }
    'accommodation.store': { paramsTuple?: []; params?: {} }
    'accommodation.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accommodation.upload_images': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accommodation.delete_image': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'imageId': ParamValue} }
    'manager_handover.freeze': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'manager_handover.unfreeze': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'manager_handover.status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invite_manager.invite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'application.incoming': { paramsTuple?: []; params?: {} }
    'application.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rooms.index': { paramsTuple: [ParamValue]; params: {'accommodationId': ParamValue} }
    'rooms.store': { paramsTuple: [ParamValue]; params: {'accommodationId': ParamValue} }
    'rooms.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rooms.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'assignments.store': { paramsTuple?: []; params?: {} }
    'assignments.move_out': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.pending': { paramsTuple?: []; params?: {} }
    'payments.verify': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.occupancy': { paramsTuple?: []; params?: {} }
    'reports.application_trends': { paramsTuple?: []; params?: {} }
    'admin_verifications.index': { paramsTuple?: []; params?: {} }
    'admin_verifications.verify': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
    'admin_settings.index': { paramsTuple?: []; params?: {} }
    'admin_settings.update': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
    'admin_settings.count_users': { paramsTuple?: []; params?: {} }
    'rooms.count_available_rooms': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'accommodation.index': { paramsTuple?: []; params?: {} }
    'accommodation.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'setups.show': { paramsTuple?: []; params?: {} }
    'application.index': { paramsTuple?: []; params?: {} }
    'assignments.current_stay': { paramsTuple?: []; params?: {} }
    'assignments.stay_history': { paramsTuple?: []; params?: {} }
    'bookmark.index': { paramsTuple?: []; params?: {} }
    'fees.index': { paramsTuple?: []; params?: {} }
    'reports.revenue': { paramsTuple?: []; params?: {} }
    'reports.delinquency': { paramsTuple?: []; params?: {} }
    'accommodation.landlord_index': { paramsTuple?: []; params?: {} }
    'manager_handover.status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'application.incoming': { paramsTuple?: []; params?: {} }
    'rooms.index': { paramsTuple: [ParamValue]; params: {'accommodationId': ParamValue} }
    'payments.pending': { paramsTuple?: []; params?: {} }
    'reports.occupancy': { paramsTuple?: []; params?: {} }
    'reports.application_trends': { paramsTuple?: []; params?: {} }
    'admin_verifications.index': { paramsTuple?: []; params?: {} }
    'admin_settings.index': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
    'admin_settings.count_users': { paramsTuple?: []; params?: {} }
    'rooms.count_available_rooms': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'accommodation.index': { paramsTuple?: []; params?: {} }
    'accommodation.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'setups.show': { paramsTuple?: []; params?: {} }
    'application.index': { paramsTuple?: []; params?: {} }
    'assignments.current_stay': { paramsTuple?: []; params?: {} }
    'assignments.stay_history': { paramsTuple?: []; params?: {} }
    'bookmark.index': { paramsTuple?: []; params?: {} }
    'fees.index': { paramsTuple?: []; params?: {} }
    'reports.revenue': { paramsTuple?: []; params?: {} }
    'reports.delinquency': { paramsTuple?: []; params?: {} }
    'accommodation.landlord_index': { paramsTuple?: []; params?: {} }
    'manager_handover.status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'application.incoming': { paramsTuple?: []; params?: {} }
    'rooms.index': { paramsTuple: [ParamValue]; params: {'accommodationId': ParamValue} }
    'payments.pending': { paramsTuple?: []; params?: {} }
    'reports.occupancy': { paramsTuple?: []; params?: {} }
    'reports.application_trends': { paramsTuple?: []; params?: {} }
    'admin_verifications.index': { paramsTuple?: []; params?: {} }
    'admin_settings.index': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
    'admin_settings.count_users': { paramsTuple?: []; params?: {} }
    'rooms.count_available_rooms': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'setups.store': { paramsTuple?: []; params?: {} }
    'application.store': { paramsTuple?: []; params?: {} }
    'bookmark.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviews.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.upload_proof': { paramsTuple: [ParamValue]; params: {'feeId': ParamValue} }
    'accommodation.store': { paramsTuple?: []; params?: {} }
    'accommodation.upload_images': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'manager_handover.freeze': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'manager_handover.unfreeze': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invite_manager.invite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rooms.store': { paramsTuple: [ParamValue]; params: {'accommodationId': ParamValue} }
    'assignments.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'accommodation.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rooms.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_settings.update': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'accommodation.delete_image': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'imageId': ParamValue} }
    'rooms.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'application.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'assignments.move_out': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.verify': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_verifications.verify': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}