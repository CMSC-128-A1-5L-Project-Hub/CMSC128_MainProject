import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'student_dashboards.index': { paramsTuple?: []; params?: {} }
    'landlord_dashboards.index': { paramsTuple?: []; params?: {} }
    'setups.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'student_dashboards.index': { paramsTuple?: []; params?: {} }
    'landlord_dashboards.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.redirect': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'student_dashboards.index': { paramsTuple?: []; params?: {} }
    'landlord_dashboards.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'setups.store': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}