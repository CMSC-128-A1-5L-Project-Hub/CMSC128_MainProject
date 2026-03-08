/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/google/redirect',
    tokens: [{"old":"/api/v1/auth/google/redirect","type":0,"val":"api","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"google","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"redirect","end":""}],
    types: placeholder as Registry['auth.redirect']['types'],
  },
  'auth.callback': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/google/callback',
    tokens: [{"old":"/api/v1/auth/google/callback","type":0,"val":"api","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"google","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth.callback']['types'],
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
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.show']['types'],
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
