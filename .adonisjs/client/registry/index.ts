/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'flags.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/flags',
    tokens: [{"old":"/api/flags","type":0,"val":"api","end":""},{"old":"/api/flags","type":0,"val":"flags","end":""}],
    types: placeholder as Registry['flags.index']['types'],
  },
  'accounts.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/accounts/:uid',
    tokens: [{"old":"/api/accounts/:uid","type":0,"val":"api","end":""},{"old":"/api/accounts/:uid","type":0,"val":"accounts","end":""},{"old":"/api/accounts/:uid","type":1,"val":"uid","end":""}],
    types: placeholder as Registry['accounts.show']['types'],
  },
  'users.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/users/:id',
    tokens: [{"old":"/api/users/:id","type":0,"val":"api","end":""},{"old":"/api/users/:id","type":0,"val":"users","end":""},{"old":"/api/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['users.show']['types'],
  },
  'email_verification.send': {
    methods: ["POST"],
    pattern: '/api/email/verify/send',
    tokens: [{"old":"/api/email/verify/send","type":0,"val":"api","end":""},{"old":"/api/email/verify/send","type":0,"val":"email","end":""},{"old":"/api/email/verify/send","type":0,"val":"verify","end":""},{"old":"/api/email/verify/send","type":0,"val":"send","end":""}],
    types: placeholder as Registry['email_verification.send']['types'],
  },
  'email_verification.verify': {
    methods: ["POST"],
    pattern: '/api/email/verify',
    tokens: [{"old":"/api/email/verify","type":0,"val":"api","end":""},{"old":"/api/email/verify","type":0,"val":"email","end":""},{"old":"/api/email/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['email_verification.verify']['types'],
  },
  'account_flag_votes.store': {
    methods: ["POST"],
    pattern: '/api/accounts/:uid/flags/:code/votes',
    tokens: [{"old":"/api/accounts/:uid/flags/:code/votes","type":0,"val":"api","end":""},{"old":"/api/accounts/:uid/flags/:code/votes","type":0,"val":"accounts","end":""},{"old":"/api/accounts/:uid/flags/:code/votes","type":1,"val":"uid","end":""},{"old":"/api/accounts/:uid/flags/:code/votes","type":0,"val":"flags","end":""},{"old":"/api/accounts/:uid/flags/:code/votes","type":1,"val":"code","end":""},{"old":"/api/accounts/:uid/flags/:code/votes","type":0,"val":"votes","end":""}],
    types: placeholder as Registry['account_flag_votes.store']['types'],
  },
  'admin.flags.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/flags',
    tokens: [{"old":"/api/admin/flags","type":0,"val":"api","end":""},{"old":"/api/admin/flags","type":0,"val":"admin","end":""},{"old":"/api/admin/flags","type":0,"val":"flags","end":""}],
    types: placeholder as Registry['admin.flags.index']['types'],
  },
  'admin.flags.store': {
    methods: ["POST"],
    pattern: '/api/admin/flags',
    tokens: [{"old":"/api/admin/flags","type":0,"val":"api","end":""},{"old":"/api/admin/flags","type":0,"val":"admin","end":""},{"old":"/api/admin/flags","type":0,"val":"flags","end":""}],
    types: placeholder as Registry['admin.flags.store']['types'],
  },
  'admin.flags.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/flags/:id',
    tokens: [{"old":"/api/admin/flags/:id","type":0,"val":"api","end":""},{"old":"/api/admin/flags/:id","type":0,"val":"admin","end":""},{"old":"/api/admin/flags/:id","type":0,"val":"flags","end":""},{"old":"/api/admin/flags/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.flags.show']['types'],
  },
  'admin.flags.update': {
    methods: ["PUT","PATCH"],
    pattern: '/api/admin/flags/:id',
    tokens: [{"old":"/api/admin/flags/:id","type":0,"val":"api","end":""},{"old":"/api/admin/flags/:id","type":0,"val":"admin","end":""},{"old":"/api/admin/flags/:id","type":0,"val":"flags","end":""},{"old":"/api/admin/flags/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.flags.update']['types'],
  },
  'admin.flags.destroy': {
    methods: ["DELETE"],
    pattern: '/api/admin/flags/:id',
    tokens: [{"old":"/api/admin/flags/:id","type":0,"val":"api","end":""},{"old":"/api/admin/flags/:id","type":0,"val":"admin","end":""},{"old":"/api/admin/flags/:id","type":0,"val":"flags","end":""},{"old":"/api/admin/flags/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.flags.destroy']['types'],
  },
  'admin.users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/users',
    tokens: [{"old":"/api/admin/users","type":0,"val":"api","end":""},{"old":"/api/admin/users","type":0,"val":"admin","end":""},{"old":"/api/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin.users.index']['types'],
  },
  'admin.users.destroy': {
    methods: ["DELETE"],
    pattern: '/api/admin/users/:id',
    tokens: [{"old":"/api/admin/users/:id","type":0,"val":"api","end":""},{"old":"/api/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/api/admin/users/:id","type":0,"val":"users","end":""},{"old":"/api/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.users.destroy']['types'],
  },
  'admin.votes.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/votes',
    tokens: [{"old":"/api/admin/votes","type":0,"val":"api","end":""},{"old":"/api/admin/votes","type":0,"val":"admin","end":""},{"old":"/api/admin/votes","type":0,"val":"votes","end":""}],
    types: placeholder as Registry['admin.votes.index']['types'],
  },
  'auth.auth.register': {
    methods: ["POST"],
    pattern: '/api/auth/register',
    tokens: [{"old":"/api/auth/register","type":0,"val":"api","end":""},{"old":"/api/auth/register","type":0,"val":"auth","end":""},{"old":"/api/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.auth.register']['types'],
  },
  'auth.auth.login': {
    methods: ["POST"],
    pattern: '/api/auth/login',
    tokens: [{"old":"/api/auth/login","type":0,"val":"api","end":""},{"old":"/api/auth/login","type":0,"val":"auth","end":""},{"old":"/api/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.auth.login']['types'],
  },
  'auth.auth.logout': {
    methods: ["POST"],
    pattern: '/api/auth/logout',
    tokens: [{"old":"/api/auth/logout","type":0,"val":"api","end":""},{"old":"/api/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.auth.logout']['types'],
  },
  'auth.auth.user': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/user',
    tokens: [{"old":"/api/auth/user","type":0,"val":"api","end":""},{"old":"/api/auth/user","type":0,"val":"auth","end":""},{"old":"/api/auth/user","type":0,"val":"user","end":""}],
    types: placeholder as Registry['auth.auth.user']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
