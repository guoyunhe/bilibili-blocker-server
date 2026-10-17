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
  'accounts.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/accounts/:uid',
    tokens: [{"old":"/api/accounts/:uid","type":0,"val":"api","end":""},{"old":"/api/accounts/:uid","type":0,"val":"accounts","end":""},{"old":"/api/accounts/:uid","type":1,"val":"uid","end":""}],
    types: placeholder as Registry['accounts.show']['types'],
  },
  'account_flag_votes.store': {
    methods: ["POST"],
    pattern: '/api/accounts/:uid/flags/:code/votes',
    tokens: [{"old":"/api/accounts/:uid/flags/:code/votes","type":0,"val":"api","end":""},{"old":"/api/accounts/:uid/flags/:code/votes","type":0,"val":"accounts","end":""},{"old":"/api/accounts/:uid/flags/:code/votes","type":1,"val":"uid","end":""},{"old":"/api/accounts/:uid/flags/:code/votes","type":0,"val":"flags","end":""},{"old":"/api/accounts/:uid/flags/:code/votes","type":1,"val":"code","end":""},{"old":"/api/accounts/:uid/flags/:code/votes","type":0,"val":"votes","end":""}],
    types: placeholder as Registry['account_flag_votes.store']['types'],
  },
  'account_flag_status.update': {
    methods: ["PATCH"],
    pattern: '/api/accounts/:uid/flags/:code/status',
    tokens: [{"old":"/api/accounts/:uid/flags/:code/status","type":0,"val":"api","end":""},{"old":"/api/accounts/:uid/flags/:code/status","type":0,"val":"accounts","end":""},{"old":"/api/accounts/:uid/flags/:code/status","type":1,"val":"uid","end":""},{"old":"/api/accounts/:uid/flags/:code/status","type":0,"val":"flags","end":""},{"old":"/api/accounts/:uid/flags/:code/status","type":1,"val":"code","end":""},{"old":"/api/accounts/:uid/flags/:code/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['account_flag_status.update']['types'],
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
