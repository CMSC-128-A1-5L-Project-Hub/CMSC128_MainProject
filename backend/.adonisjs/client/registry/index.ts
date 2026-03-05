/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google/redirect',
    tokens: [{"old":"/auth/google/redirect","type":0,"val":"auth","end":""},{"old":"/auth/google/redirect","type":0,"val":"google","end":""},{"old":"/auth/google/redirect","type":0,"val":"redirect","end":""}],
    types: placeholder as Registry['auth.redirect']['types'],
  },
  'auth.callback': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google/callback',
    tokens: [{"old":"/auth/google/callback","type":0,"val":"auth","end":""},{"old":"/auth/google/callback","type":0,"val":"google","end":""},{"old":"/auth/google/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth.callback']['types'],
  },
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_token.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_token.store']['types'],
  },
  'auth.access_token.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.access_token.destroy']['types'],
  },
  'setups.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/setup',
    tokens: [{"old":"/api/v1/setup","type":0,"val":"api","end":""},{"old":"/api/v1/setup","type":0,"val":"v1","end":""},{"old":"/api/v1/setup","type":0,"val":"setup","end":""}],
    types: placeholder as Registry['setups.show']['types'],
  },
  'setups.store': {
    methods: ["POST"],
    pattern: '/api/v1/setup',
    tokens: [{"old":"/api/v1/setup","type":0,"val":"api","end":""},{"old":"/api/v1/setup","type":0,"val":"v1","end":""},{"old":"/api/v1/setup","type":0,"val":"setup","end":""}],
    types: placeholder as Registry['setups.store']['types'],
  },
  'student_dashboards.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/dashboard/student',
    tokens: [{"old":"/api/v1/dashboard/student","type":0,"val":"api","end":""},{"old":"/api/v1/dashboard/student","type":0,"val":"v1","end":""},{"old":"/api/v1/dashboard/student","type":0,"val":"dashboard","end":""},{"old":"/api/v1/dashboard/student","type":0,"val":"student","end":""}],
    types: placeholder as Registry['student_dashboards.index']['types'],
  },
  'landlord_dashboards.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/dashboard/landlord',
    tokens: [{"old":"/api/v1/dashboard/landlord","type":0,"val":"api","end":""},{"old":"/api/v1/dashboard/landlord","type":0,"val":"v1","end":""},{"old":"/api/v1/dashboard/landlord","type":0,"val":"dashboard","end":""},{"old":"/api/v1/dashboard/landlord","type":0,"val":"landlord","end":""}],
    types: placeholder as Registry['landlord_dashboards.index']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
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
