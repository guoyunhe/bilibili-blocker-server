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
  'stats.extensions': {
    methods: ["GET","HEAD"],
    pattern: '/api/stats/extensions',
    tokens: [{"old":"/api/stats/extensions","type":0,"val":"api","end":""},{"old":"/api/stats/extensions","type":0,"val":"stats","end":""},{"old":"/api/stats/extensions","type":0,"val":"extensions","end":""}],
    types: placeholder as Registry['stats.extensions']['types'],
  },
  'stats.contributors': {
    methods: ["GET","HEAD"],
    pattern: '/api/stats/contributors',
    tokens: [{"old":"/api/stats/contributors","type":0,"val":"api","end":""},{"old":"/api/stats/contributors","type":0,"val":"stats","end":""},{"old":"/api/stats/contributors","type":0,"val":"contributors","end":""}],
    types: placeholder as Registry['stats.contributors']['types'],
  },
  'stats.marked_accounts': {
    methods: ["GET","HEAD"],
    pattern: '/api/stats/marked-accounts',
    tokens: [{"old":"/api/stats/marked-accounts","type":0,"val":"api","end":""},{"old":"/api/stats/marked-accounts","type":0,"val":"stats","end":""},{"old":"/api/stats/marked-accounts","type":0,"val":"marked-accounts","end":""}],
    types: placeholder as Registry['stats.marked_accounts']['types'],
  },
  'stats.votes': {
    methods: ["GET","HEAD"],
    pattern: '/api/stats/votes',
    tokens: [{"old":"/api/stats/votes","type":0,"val":"api","end":""},{"old":"/api/stats/votes","type":0,"val":"stats","end":""},{"old":"/api/stats/votes","type":0,"val":"votes","end":""}],
    types: placeholder as Registry['stats.votes']['types'],
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
  'auth.register': {
    methods: ["POST"],
    pattern: '/api/auth/register',
    tokens: [{"old":"/api/auth/register","type":0,"val":"api","end":""},{"old":"/api/auth/register","type":0,"val":"auth","end":""},{"old":"/api/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.login': {
    methods: ["POST"],
    pattern: '/api/auth/login',
    tokens: [{"old":"/api/auth/login","type":0,"val":"api","end":""},{"old":"/api/auth/login","type":0,"val":"auth","end":""},{"old":"/api/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/api/auth/logout',
    tokens: [{"old":"/api/auth/logout","type":0,"val":"api","end":""},{"old":"/api/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'auth.user': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/user',
    tokens: [{"old":"/api/auth/user","type":0,"val":"api","end":""},{"old":"/api/auth/user","type":0,"val":"auth","end":""},{"old":"/api/auth/user","type":0,"val":"user","end":""}],
    types: placeholder as Registry['auth.user']['types'],
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
