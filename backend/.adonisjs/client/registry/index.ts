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
  'setups.store': {
    methods: ["POST"],
    pattern: '/api/v1/setup',
    tokens: [{"old":"/api/v1/setup","type":0,"val":"api","end":""},{"old":"/api/v1/setup","type":0,"val":"v1","end":""},{"old":"/api/v1/setup","type":0,"val":"setup","end":""}],
    types: placeholder as Registry['setups.store']['types'],
  },
  'admin_verifications.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/users/pending',
    tokens: [{"old":"/api/v1/admin/users/pending","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/pending","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/pending","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/pending","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/pending","type":0,"val":"pending","end":""}],
    types: placeholder as Registry['admin_verifications.index']['types'],
  },
  'admin_verifications.verify': {
    methods: ["PATCH"],
    pattern: '/api/v1/admin/users/:userId/verify',
    tokens: [{"old":"/api/v1/admin/users/:userId/verify","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:userId/verify","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:userId/verify","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:userId/verify","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:userId/verify","type":1,"val":"userId","end":""},{"old":"/api/v1/admin/users/:userId/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['admin_verifications.verify']['types'],
  },
  'application.incoming': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/applications/incoming',
    tokens: [{"old":"/api/v1/applications/incoming","type":0,"val":"api","end":""},{"old":"/api/v1/applications/incoming","type":0,"val":"v1","end":""},{"old":"/api/v1/applications/incoming","type":0,"val":"applications","end":""},{"old":"/api/v1/applications/incoming","type":0,"val":"incoming","end":""}],
    types: placeholder as Registry['application.incoming']['types'],
  },
  'application.update_status': {
    methods: ["PATCH"],
    pattern: '/api/v1/applications/:id/review',
    tokens: [{"old":"/api/v1/applications/:id/review","type":0,"val":"api","end":""},{"old":"/api/v1/applications/:id/review","type":0,"val":"v1","end":""},{"old":"/api/v1/applications/:id/review","type":0,"val":"applications","end":""},{"old":"/api/v1/applications/:id/review","type":1,"val":"id","end":""},{"old":"/api/v1/applications/:id/review","type":0,"val":"review","end":""}],
    types: placeholder as Registry['application.update_status']['types'],
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
