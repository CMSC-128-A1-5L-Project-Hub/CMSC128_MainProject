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
  'auth.update_me': {
    methods: ["PUT"],
    pattern: '/me',
    tokens: [{"old":"/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth.update_me']['types'],
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
  'sms_verifications.verify': {
    methods: ["POST"],
    pattern: '/auth/verify-sms',
    tokens: [{"old":"/auth/verify-sms","type":0,"val":"auth","end":""},{"old":"/auth/verify-sms","type":0,"val":"verify-sms","end":""}],
    types: placeholder as Registry['sms_verifications.verify']['types'],
  },
  'sms_verifications.send': {
    methods: ["POST"],
    pattern: '/auth/send-otp',
    tokens: [{"old":"/auth/send-otp","type":0,"val":"auth","end":""},{"old":"/auth/send-otp","type":0,"val":"send-otp","end":""}],
    types: placeholder as Registry['sms_verifications.send']['types'],
  },
  'application.store': {
    methods: ["POST"],
    pattern: '/applications',
    tokens: [{"old":"/applications","type":0,"val":"applications","end":""}],
    types: placeholder as Registry['application.store']['types'],
  },
  'application.index': {
    methods: ["GET","HEAD"],
    pattern: '/applications/my-applications',
    tokens: [{"old":"/applications/my-applications","type":0,"val":"applications","end":""},{"old":"/applications/my-applications","type":0,"val":"my-applications","end":""}],
    types: placeholder as Registry['application.index']['types'],
  },
  'assignments.current_stay': {
    methods: ["GET","HEAD"],
    pattern: '/my-stay/current',
    tokens: [{"old":"/my-stay/current","type":0,"val":"my-stay","end":""},{"old":"/my-stay/current","type":0,"val":"current","end":""}],
    types: placeholder as Registry['assignments.current_stay']['types'],
  },
  'assignments.stay_history': {
    methods: ["GET","HEAD"],
    pattern: '/my-stay/history',
    tokens: [{"old":"/my-stay/history","type":0,"val":"my-stay","end":""},{"old":"/my-stay/history","type":0,"val":"history","end":""}],
    types: placeholder as Registry['assignments.stay_history']['types'],
  },
  'bookmark.toggle': {
    methods: ["POST"],
    pattern: '/accommodations/:id/bookmarks',
    tokens: [{"old":"/accommodations/:id/bookmarks","type":0,"val":"accommodations","end":""},{"old":"/accommodations/:id/bookmarks","type":1,"val":"id","end":""},{"old":"/accommodations/:id/bookmarks","type":0,"val":"bookmarks","end":""}],
    types: placeholder as Registry['bookmark.toggle']['types'],
  },
  'bookmark.index': {
    methods: ["GET","HEAD"],
    pattern: '/my-bookmarks',
    tokens: [{"old":"/my-bookmarks","type":0,"val":"my-bookmarks","end":""}],
    types: placeholder as Registry['bookmark.index']['types'],
  },
  'reviews.store': {
    methods: ["POST"],
    pattern: '/accommodations/:id/reviews',
    tokens: [{"old":"/accommodations/:id/reviews","type":0,"val":"accommodations","end":""},{"old":"/accommodations/:id/reviews","type":1,"val":"id","end":""},{"old":"/accommodations/:id/reviews","type":0,"val":"reviews","end":""}],
    types: placeholder as Registry['reviews.store']['types'],
  },
  'fees.index': {
    methods: ["GET","HEAD"],
    pattern: '/my-fees',
    tokens: [{"old":"/my-fees","type":0,"val":"my-fees","end":""}],
    types: placeholder as Registry['fees.index']['types'],
  },
  'payments.upload_proof': {
    methods: ["POST"],
    pattern: '/payments/:feeId/pay',
    tokens: [{"old":"/payments/:feeId/pay","type":0,"val":"payments","end":""},{"old":"/payments/:feeId/pay","type":1,"val":"feeId","end":""},{"old":"/payments/:feeId/pay","type":0,"val":"pay","end":""}],
    types: placeholder as Registry['payments.upload_proof']['types'],
  },
  'payments.get_student_payment_history': {
    methods: ["GET","HEAD"],
    pattern: '/my-payments',
    tokens: [{"old":"/my-payments","type":0,"val":"my-payments","end":""}],
    types: placeholder as Registry['payments.get_student_payment_history']['types'],
  },
  'student_profiles.show': {
    methods: ["GET","HEAD"],
    pattern: '/student/profile',
    tokens: [{"old":"/student/profile","type":0,"val":"student","end":""},{"old":"/student/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['student_profiles.show']['types'],
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
  'accommodation.landlord_index': {
    methods: ["GET","HEAD"],
    pattern: '/landlord/accommodations',
    tokens: [{"old":"/landlord/accommodations","type":0,"val":"landlord","end":""},{"old":"/landlord/accommodations","type":0,"val":"accommodations","end":""}],
    types: placeholder as Registry['accommodation.landlord_index']['types'],
  },
  'accommodation.store': {
    methods: ["POST"],
    pattern: '/landlord/accommodations',
    tokens: [{"old":"/landlord/accommodations","type":0,"val":"landlord","end":""},{"old":"/landlord/accommodations","type":0,"val":"accommodations","end":""}],
    types: placeholder as Registry['accommodation.store']['types'],
  },
  'accommodation.update': {
    methods: ["PUT"],
    pattern: '/landlord/accommodations/:id',
    tokens: [{"old":"/landlord/accommodations/:id","type":0,"val":"landlord","end":""},{"old":"/landlord/accommodations/:id","type":0,"val":"accommodations","end":""},{"old":"/landlord/accommodations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['accommodation.update']['types'],
  },
  'accommodation.upload_images': {
    methods: ["POST"],
    pattern: '/landlord/accommodations/:id/images',
    tokens: [{"old":"/landlord/accommodations/:id/images","type":0,"val":"landlord","end":""},{"old":"/landlord/accommodations/:id/images","type":0,"val":"accommodations","end":""},{"old":"/landlord/accommodations/:id/images","type":1,"val":"id","end":""},{"old":"/landlord/accommodations/:id/images","type":0,"val":"images","end":""}],
    types: placeholder as Registry['accommodation.upload_images']['types'],
  },
  'accommodation.delete_image': {
    methods: ["DELETE"],
    pattern: '/landlord/accommodations/:id/images/:imageId',
    tokens: [{"old":"/landlord/accommodations/:id/images/:imageId","type":0,"val":"landlord","end":""},{"old":"/landlord/accommodations/:id/images/:imageId","type":0,"val":"accommodations","end":""},{"old":"/landlord/accommodations/:id/images/:imageId","type":1,"val":"id","end":""},{"old":"/landlord/accommodations/:id/images/:imageId","type":0,"val":"images","end":""},{"old":"/landlord/accommodations/:id/images/:imageId","type":1,"val":"imageId","end":""}],
    types: placeholder as Registry['accommodation.delete_image']['types'],
  },
  'manager_handover.freeze': {
    methods: ["POST"],
    pattern: '/landlord/accommodations/:id/freeze',
    tokens: [{"old":"/landlord/accommodations/:id/freeze","type":0,"val":"landlord","end":""},{"old":"/landlord/accommodations/:id/freeze","type":0,"val":"accommodations","end":""},{"old":"/landlord/accommodations/:id/freeze","type":1,"val":"id","end":""},{"old":"/landlord/accommodations/:id/freeze","type":0,"val":"freeze","end":""}],
    types: placeholder as Registry['manager_handover.freeze']['types'],
  },
  'manager_handover.unfreeze': {
    methods: ["POST"],
    pattern: '/landlord/accommodations/:id/unfreeze',
    tokens: [{"old":"/landlord/accommodations/:id/unfreeze","type":0,"val":"landlord","end":""},{"old":"/landlord/accommodations/:id/unfreeze","type":0,"val":"accommodations","end":""},{"old":"/landlord/accommodations/:id/unfreeze","type":1,"val":"id","end":""},{"old":"/landlord/accommodations/:id/unfreeze","type":0,"val":"unfreeze","end":""}],
    types: placeholder as Registry['manager_handover.unfreeze']['types'],
  },
  'manager_handover.status': {
    methods: ["GET","HEAD"],
    pattern: '/landlord/accommodations/:id/freeze-status',
    tokens: [{"old":"/landlord/accommodations/:id/freeze-status","type":0,"val":"landlord","end":""},{"old":"/landlord/accommodations/:id/freeze-status","type":0,"val":"accommodations","end":""},{"old":"/landlord/accommodations/:id/freeze-status","type":1,"val":"id","end":""},{"old":"/landlord/accommodations/:id/freeze-status","type":0,"val":"freeze-status","end":""}],
    types: placeholder as Registry['manager_handover.status']['types'],
  },
  'invite_manager.invite': {
    methods: ["POST"],
    pattern: '/landlord/accommodations/:id/invite-manager',
    tokens: [{"old":"/landlord/accommodations/:id/invite-manager","type":0,"val":"landlord","end":""},{"old":"/landlord/accommodations/:id/invite-manager","type":0,"val":"accommodations","end":""},{"old":"/landlord/accommodations/:id/invite-manager","type":1,"val":"id","end":""},{"old":"/landlord/accommodations/:id/invite-manager","type":0,"val":"invite-manager","end":""}],
    types: placeholder as Registry['invite_manager.invite']['types'],
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
  'rooms.index': {
    methods: ["GET","HEAD"],
    pattern: '/accommodations/:accommodationId/rooms',
    tokens: [{"old":"/accommodations/:accommodationId/rooms","type":0,"val":"accommodations","end":""},{"old":"/accommodations/:accommodationId/rooms","type":1,"val":"accommodationId","end":""},{"old":"/accommodations/:accommodationId/rooms","type":0,"val":"rooms","end":""}],
    types: placeholder as Registry['rooms.index']['types'],
  },
  'rooms.store': {
    methods: ["POST"],
    pattern: '/accommodations/:accommodationId/rooms',
    tokens: [{"old":"/accommodations/:accommodationId/rooms","type":0,"val":"accommodations","end":""},{"old":"/accommodations/:accommodationId/rooms","type":1,"val":"accommodationId","end":""},{"old":"/accommodations/:accommodationId/rooms","type":0,"val":"rooms","end":""}],
    types: placeholder as Registry['rooms.store']['types'],
  },
  'rooms.update': {
    methods: ["PUT"],
    pattern: '/rooms/:id',
    tokens: [{"old":"/rooms/:id","type":0,"val":"rooms","end":""},{"old":"/rooms/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['rooms.update']['types'],
  },
  'rooms.destroy': {
    methods: ["DELETE"],
    pattern: '/rooms/:id',
    tokens: [{"old":"/rooms/:id","type":0,"val":"rooms","end":""},{"old":"/rooms/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['rooms.destroy']['types'],
  },
  'assignments.store': {
    methods: ["POST"],
    pattern: '/assignments',
    tokens: [{"old":"/assignments","type":0,"val":"assignments","end":""}],
    types: placeholder as Registry['assignments.store']['types'],
  },
  'assignments.move_out': {
    methods: ["PATCH"],
    pattern: '/assignments/:id/move-out',
    tokens: [{"old":"/assignments/:id/move-out","type":0,"val":"assignments","end":""},{"old":"/assignments/:id/move-out","type":1,"val":"id","end":""},{"old":"/assignments/:id/move-out","type":0,"val":"move-out","end":""}],
    types: placeholder as Registry['assignments.move_out']['types'],
  },
  'payments.pending': {
    methods: ["GET","HEAD"],
    pattern: '/payments/pending',
    tokens: [{"old":"/payments/pending","type":0,"val":"payments","end":""},{"old":"/payments/pending","type":0,"val":"pending","end":""}],
    types: placeholder as Registry['payments.pending']['types'],
  },
  'payments.verify': {
    methods: ["PATCH"],
    pattern: '/payments/:id/verify',
    tokens: [{"old":"/payments/:id/verify","type":0,"val":"payments","end":""},{"old":"/payments/:id/verify","type":1,"val":"id","end":""},{"old":"/payments/:id/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['payments.verify']['types'],
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
  'accommodation.export_documents': {
    methods: ["GET","HEAD"],
    pattern: '/accommodations/:id/export-documents',
    tokens: [{"old":"/accommodations/:id/export-documents","type":0,"val":"accommodations","end":""},{"old":"/accommodations/:id/export-documents","type":1,"val":"id","end":""},{"old":"/accommodations/:id/export-documents","type":0,"val":"export-documents","end":""}],
    types: placeholder as Registry['accommodation.export_documents']['types'],
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
  'admin_settings.count_users': {
    methods: ["GET","HEAD"],
    pattern: '/admin/users/count',
    tokens: [{"old":"/admin/users/count","type":0,"val":"admin","end":""},{"old":"/admin/users/count","type":0,"val":"users","end":""},{"old":"/admin/users/count","type":0,"val":"count","end":""}],
    types: placeholder as Registry['admin_settings.count_users']['types'],
  },
  'rooms.count_available_rooms': {
    methods: ["GET","HEAD"],
    pattern: '/admin/rooms/available/count',
    tokens: [{"old":"/admin/rooms/available/count","type":0,"val":"admin","end":""},{"old":"/admin/rooms/available/count","type":0,"val":"rooms","end":""},{"old":"/admin/rooms/available/count","type":0,"val":"available","end":""},{"old":"/admin/rooms/available/count","type":0,"val":"count","end":""}],
    types: placeholder as Registry['rooms.count_available_rooms']['types'],
  },
  'admin_accommodations.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/accommodations/pending',
    tokens: [{"old":"/admin/accommodations/pending","type":0,"val":"admin","end":""},{"old":"/admin/accommodations/pending","type":0,"val":"accommodations","end":""},{"old":"/admin/accommodations/pending","type":0,"val":"pending","end":""}],
    types: placeholder as Registry['admin_accommodations.index']['types'],
  },
  'admin_accommodations.verify': {
    methods: ["PATCH"],
    pattern: '/admin/accommodations/:id/verify',
    tokens: [{"old":"/admin/accommodations/:id/verify","type":0,"val":"admin","end":""},{"old":"/admin/accommodations/:id/verify","type":0,"val":"accommodations","end":""},{"old":"/admin/accommodations/:id/verify","type":1,"val":"id","end":""},{"old":"/admin/accommodations/:id/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['admin_accommodations.verify']['types'],
  },
  'notifications.index': {
    methods: ["GET","HEAD"],
    pattern: '/notifications',
    tokens: [{"old":"/notifications","type":0,"val":"notifications","end":""}],
    types: placeholder as Registry['notifications.index']['types'],
  },
  'notifications.update': {
    methods: ["PATCH"],
    pattern: '/notifications/:id',
    tokens: [{"old":"/notifications/:id","type":0,"val":"notifications","end":""},{"old":"/notifications/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['notifications.update']['types'],
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
