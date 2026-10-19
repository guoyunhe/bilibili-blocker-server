import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'flags.index': { paramsTuple?: []; params?: {} }
    'accounts.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'email_verification.send': { paramsTuple?: []; params?: {} }
    'email_verification.verify': { paramsTuple?: []; params?: {} }
    'account_flag_votes.store': { paramsTuple: [ParamValue,ParamValue]; params: {'uid': ParamValue,'code': ParamValue} }
    'admin.flags.index': { paramsTuple?: []; params?: {} }
    'admin.flags.store': { paramsTuple?: []; params?: {} }
    'admin.flags.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.flags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.flags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.votes.index': { paramsTuple?: []; params?: {} }
    'auth.auth.register': { paramsTuple?: []; params?: {} }
    'auth.auth.login': { paramsTuple?: []; params?: {} }
    'auth.auth.logout': { paramsTuple?: []; params?: {} }
    'auth.auth.user': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'flags.index': { paramsTuple?: []; params?: {} }
    'accounts.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.flags.index': { paramsTuple?: []; params?: {} }
    'admin.flags.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.votes.index': { paramsTuple?: []; params?: {} }
    'auth.auth.user': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'flags.index': { paramsTuple?: []; params?: {} }
    'accounts.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.flags.index': { paramsTuple?: []; params?: {} }
    'admin.flags.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.votes.index': { paramsTuple?: []; params?: {} }
    'auth.auth.user': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'email_verification.send': { paramsTuple?: []; params?: {} }
    'email_verification.verify': { paramsTuple?: []; params?: {} }
    'account_flag_votes.store': { paramsTuple: [ParamValue,ParamValue]; params: {'uid': ParamValue,'code': ParamValue} }
    'admin.flags.store': { paramsTuple?: []; params?: {} }
    'auth.auth.register': { paramsTuple?: []; params?: {} }
    'auth.auth.login': { paramsTuple?: []; params?: {} }
    'auth.auth.logout': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'admin.flags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'admin.flags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'admin.flags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}