import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'accounts.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'account_flag_votes.store': { paramsTuple: [ParamValue,ParamValue]; params: {'uid': ParamValue,'code': ParamValue} }
    'account_flag_status.update': { paramsTuple: [ParamValue,ParamValue]; params: {'uid': ParamValue,'code': ParamValue} }
    'auth.auth.register': { paramsTuple?: []; params?: {} }
    'auth.auth.login': { paramsTuple?: []; params?: {} }
    'auth.auth.logout': { paramsTuple?: []; params?: {} }
    'auth.auth.user': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'accounts.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'auth.auth.user': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'accounts.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'auth.auth.user': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'account_flag_votes.store': { paramsTuple: [ParamValue,ParamValue]; params: {'uid': ParamValue,'code': ParamValue} }
    'auth.auth.register': { paramsTuple?: []; params?: {} }
    'auth.auth.login': { paramsTuple?: []; params?: {} }
    'auth.auth.logout': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'account_flag_status.update': { paramsTuple: [ParamValue,ParamValue]; params: {'uid': ParamValue,'code': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}