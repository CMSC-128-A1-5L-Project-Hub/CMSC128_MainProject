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
    'reports.revenue': { paramsTuple?: []; params?: {} }
    'reports.delinquency': { paramsTuple?: []; params?: {} }
    'application.incoming': { paramsTuple?: []; params?: {} }
    'application.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.occupancy': { paramsTuple?: []; params?: {} }
    'reports.application_trends': { paramsTuple?: []; params?: {} }
    'admin_verifications.index': { paramsTuple?: []; params?: {} }
    'admin_verifications.verify': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
    'admin_settings.index': { paramsTuple?: []; params?: {} }
    'admin_settings.update': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'accommodation.index': { paramsTuple?: []; params?: {} }
    'accommodation.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'setups.show': { paramsTuple?: []; params?: {} }
    'reports.revenue': { paramsTuple?: []; params?: {} }
    'reports.delinquency': { paramsTuple?: []; params?: {} }
    'application.incoming': { paramsTuple?: []; params?: {} }
    'reports.occupancy': { paramsTuple?: []; params?: {} }
    'reports.application_trends': { paramsTuple?: []; params?: {} }
    'admin_verifications.index': { paramsTuple?: []; params?: {} }
    'admin_settings.index': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'accommodation.index': { paramsTuple?: []; params?: {} }
    'accommodation.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'setups.show': { paramsTuple?: []; params?: {} }
    'reports.revenue': { paramsTuple?: []; params?: {} }
    'reports.delinquency': { paramsTuple?: []; params?: {} }
    'application.incoming': { paramsTuple?: []; params?: {} }
    'reports.occupancy': { paramsTuple?: []; params?: {} }
    'reports.application_trends': { paramsTuple?: []; params?: {} }
    'admin_verifications.index': { paramsTuple?: []; params?: {} }
    'admin_settings.index': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'setups.store': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'application.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_verifications.verify': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
  }
  PUT: {
    'admin_settings.update': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}