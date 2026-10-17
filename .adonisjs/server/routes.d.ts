import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'accounts.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'account_flag_votes.store': { paramsTuple: [ParamValue,ParamValue]; params: {'uid': ParamValue,'code': ParamValue} }
    'auth.auth.register': { paramsTuple?: []; params?: {} }
    'auth.auth.login': { paramsTuple?: []; params?: {} }
    'auth.auth.logout': { paramsTuple?: []; params?: {} }
    'auth.auth.user': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'accounts.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'auth.auth.user': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'accounts.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'auth.auth.user': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'account_flag_votes.store': { paramsTuple: [ParamValue,ParamValue]; params: {'uid': ParamValue,'code': ParamValue} }
    'auth.auth.register': { paramsTuple?: []; params?: {} }
    'auth.auth.login': { paramsTuple?: []; params?: {} }
    'auth.auth.logout': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}