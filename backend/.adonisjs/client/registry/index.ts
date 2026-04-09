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
  'accommodation.index': {
    methods: ["GET","HEAD"],
    pattern: '/accommodations',
    tokens: [{"old":"/accommodations","type":0,"val":"accommodations","end":""}],
    types: placeholder as Registry['accommodation.index']['types'],
  },
  'accommodation.show': {
    methods: ["GET","HEAD"],
    pattern: '/accommodations/:id',
    tokens: [{"old":"/accommodations/:id","type":0,"val":"accommodations","end":""},{"old":"/accommodations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['accommodation.show']['types'],
  },
  'auth.me': {
    methods: ["GET","HEAD"],
    pattern: '/me',
    tokens: [{"old":"/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth.me']['types'],
  },
  'setups.show': {
    methods: ["GET","HEAD"],
    pattern: '/setup',
    tokens: [{"old":"/setup","type":0,"val":"setup","end":""}],
    types: placeholder as Registry['setups.show']['types'],
  },
  'setups.store': {
    methods: ["POST"],
    pattern: '/setup',
    tokens: [{"old":"/setup","type":0,"val":"setup","end":""}],
    types: placeholder as Registry['setups.store']['types'],
  },
  'reports.revenue': {
    methods: ["GET","HEAD"],
    pattern: '/reports/revenue',
    tokens: [{"old":"/reports/revenue","type":0,"val":"reports","end":""},{"old":"/reports/revenue","type":0,"val":"revenue","end":""}],
    types: placeholder as Registry['reports.revenue']['types'],
  },
  'reports.delinquency': {
    methods: ["GET","HEAD"],
    pattern: '/reports/delinquency',
    tokens: [{"old":"/reports/delinquency","type":0,"val":"reports","end":""},{"old":"/reports/delinquency","type":0,"val":"delinquency","end":""}],
    types: placeholder as Registry['reports.delinquency']['types'],
  },
  'application.incoming': {
    methods: ["GET","HEAD"],
    pattern: '/applications/incoming',
    tokens: [{"old":"/applications/incoming","type":0,"val":"applications","end":""},{"old":"/applications/incoming","type":0,"val":"incoming","end":""}],
    types: placeholder as Registry['application.incoming']['types'],
  },
  'application.update_status': {
    methods: ["PATCH"],
    pattern: '/applications/:id/review',
    tokens: [{"old":"/applications/:id/review","type":0,"val":"applications","end":""},{"old":"/applications/:id/review","type":1,"val":"id","end":""},{"old":"/applications/:id/review","type":0,"val":"review","end":""}],
    types: placeholder as Registry['application.update_status']['types'],
  },
  'reports.occupancy': {
    methods: ["GET","HEAD"],
    pattern: '/reports/occupancy',
    tokens: [{"old":"/reports/occupancy","type":0,"val":"reports","end":""},{"old":"/reports/occupancy","type":0,"val":"occupancy","end":""}],
    types: placeholder as Registry['reports.occupancy']['types'],
  },
  'reports.application_trends': {
    methods: ["GET","HEAD"],
    pattern: '/reports/applications',
    tokens: [{"old":"/reports/applications","type":0,"val":"reports","end":""},{"old":"/reports/applications","type":0,"val":"applications","end":""}],
    types: placeholder as Registry['reports.application_trends']['types'],
  },
  'admin_verifications.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/users/pending',
    tokens: [{"old":"/admin/users/pending","type":0,"val":"admin","end":""},{"old":"/admin/users/pending","type":0,"val":"users","end":""},{"old":"/admin/users/pending","type":0,"val":"pending","end":""}],
    types: placeholder as Registry['admin_verifications.index']['types'],
  },
  'admin_verifications.verify': {
    methods: ["PATCH"],
    pattern: '/admin/users/:userId/verify',
    tokens: [{"old":"/admin/users/:userId/verify","type":0,"val":"admin","end":""},{"old":"/admin/users/:userId/verify","type":0,"val":"users","end":""},{"old":"/admin/users/:userId/verify","type":1,"val":"userId","end":""},{"old":"/admin/users/:userId/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['admin_verifications.verify']['types'],
  },
  'admin_settings.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/settings',
    tokens: [{"old":"/admin/settings","type":0,"val":"admin","end":""},{"old":"/admin/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['admin_settings.index']['types'],
  },
  'admin_settings.update': {
    methods: ["PUT"],
    pattern: '/admin/settings',
    tokens: [{"old":"/admin/settings","type":0,"val":"admin","end":""},{"old":"/admin/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['admin_settings.update']['types'],
  },
  'logs.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/logs',
    tokens: [{"old":"/admin/logs","type":0,"val":"admin","end":""},{"old":"/admin/logs","type":0,"val":"logs","end":""}],
    types: placeholder as Registry['logs.index']['types'],
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
