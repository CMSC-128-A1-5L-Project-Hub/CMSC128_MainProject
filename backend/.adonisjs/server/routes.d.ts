import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'student_dashboards.index': { paramsTuple?: []; params?: {} }
    'landlord_dashboards.index': { paramsTuple?: []; params?: {} }
    'setups.store': { paramsTuple?: []; params?: {} }
    'admin_verifications.index': { paramsTuple?: []; params?: {} }
    'admin_verifications.verify': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
    'application.incoming': { paramsTuple?: []; params?: {} }
    'application.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'student_dashboards.index': { paramsTuple?: []; params?: {} }
    'landlord_dashboards.index': { paramsTuple?: []; params?: {} }
    'admin_verifications.index': { paramsTuple?: []; params?: {} }
    'application.incoming': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'student_dashboards.index': { paramsTuple?: []; params?: {} }
    'landlord_dashboards.index': { paramsTuple?: []; params?: {} }
    'admin_verifications.index': { paramsTuple?: []; params?: {} }
    'application.incoming': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'setups.store': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'admin_verifications.verify': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
    'application.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}