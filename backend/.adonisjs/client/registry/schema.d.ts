/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google/redirect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['redirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['redirect']>>>
    }
  }
  'auth.callback': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['callback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['callback']>>>
    }
  }
  'accommodation.index': {
    methods: ["GET","HEAD"]
    pattern: '/accommodations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['index']>>>
    }
  }
  'accommodation.show': {
    methods: ["GET","HEAD"]
    pattern: '/accommodations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['show']>>>
    }
  }
  'auth.me': {
    methods: ["GET","HEAD"]
    pattern: '/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['me']>>>
    }
  }
  'setups.show': {
    methods: ["GET","HEAD"]
    pattern: '/setup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/setups_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/setups_controller').default['show']>>>
    }
  }
  'setups.store': {
    methods: ["POST"]
    pattern: '/setup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile').setupProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile').setupProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/setups_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/setups_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'application.store': {
    methods: ["POST"]
    pattern: '/applications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_controller').default['store']>>>
    }
  }
  'application.index': {
    methods: ["GET","HEAD"]
    pattern: '/applications/my-applications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_controller').default['index']>>>
    }
  }
  'assignments.current_stay': {
    methods: ["GET","HEAD"]
    pattern: '/my-stay/current'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments_controller').default['currentStay']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments_controller').default['currentStay']>>>
    }
  }
  'assignments.stay_history': {
    methods: ["GET","HEAD"]
    pattern: '/my-stay/history'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments_controller').default['stayHistory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments_controller').default['stayHistory']>>>
    }
  }
  'bookmark.toggle': {
    methods: ["POST"]
    pattern: '/accommodations/:id/bookmarks'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/bookmark_controller').default['toggle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/bookmark_controller').default['toggle']>>>
    }
  }
  'bookmark.index': {
    methods: ["GET","HEAD"]
    pattern: '/my-bookmarks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/bookmark_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/bookmark_controller').default['index']>>>
    }
  }
  'reviews.store': {
    methods: ["POST"]
    pattern: '/accommodations/:id/reviews'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reviews_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reviews_controller').default['store']>>>
    }
  }
  'fees.index': {
    methods: ["GET","HEAD"]
    pattern: '/my-fees'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fees_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fees_controller').default['index']>>>
    }
  }
  'payments.upload_proof': {
    methods: ["POST"]
    pattern: '/payments/:feeId/pay'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { feeId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['uploadProof']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['uploadProof']>>>
    }
  }
  'reports.revenue': {
    methods: ["GET","HEAD"]
    pattern: '/reports/revenue'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['revenue']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['revenue']>>>
    }
  }
  'reports.delinquency': {
    methods: ["GET","HEAD"]
    pattern: '/reports/delinquency'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['delinquency']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['delinquency']>>>
    }
  }
  'accommodation.landlord_index': {
    methods: ["GET","HEAD"]
    pattern: '/landlord/accommodations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['landlordIndex']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['landlordIndex']>>>
    }
  }
  'accommodation.store': {
    methods: ["POST"]
    pattern: '/landlord/accommodations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['store']>>>
    }
  }
  'accommodation.update': {
    methods: ["PUT"]
    pattern: '/landlord/accommodations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['update']>>>
    }
  }
  'accommodation.upload_images': {
    methods: ["POST"]
    pattern: '/landlord/accommodations/:id/images'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['uploadImages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['uploadImages']>>>
    }
  }
  'accommodation.delete_image': {
    methods: ["DELETE"]
    pattern: '/landlord/accommodations/:id/images/:imageId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; imageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['deleteImage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accommodation_controller').default['deleteImage']>>>
    }
  }
  'manager_handover.freeze': {
    methods: ["POST"]
    pattern: '/landlord/accommodations/:id/freeze'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/manager_handover').default['freeze']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/manager_handover').default['freeze']>>>
    }
  }
  'manager_handover.unfreeze': {
    methods: ["POST"]
    pattern: '/landlord/accommodations/:id/unfreeze'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/manager_handover').default['unfreeze']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/manager_handover').default['unfreeze']>>>
    }
  }
  'manager_handover.status': {
    methods: ["GET","HEAD"]
    pattern: '/landlord/accommodations/:id/freeze-status'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/manager_handover').default['status']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/manager_handover').default['status']>>>
    }
  }
  'invite_manager.invite': {
    methods: ["POST"]
    pattern: '/landlord/accommodations/:id/invite-manager'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invite_manager_controller').default['invite']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invite_manager_controller').default['invite']>>>
    }
  }
  'application.incoming': {
    methods: ["GET","HEAD"]
    pattern: '/applications/incoming'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_controller').default['incoming']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_controller').default['incoming']>>>
    }
  }
  'application.update_status': {
    methods: ["PATCH"]
    pattern: '/applications/:id/review'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_controller').default['updateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_controller').default['updateStatus']>>>
    }
  }
  'rooms.index': {
    methods: ["GET","HEAD"]
    pattern: '/accommodations/:accommodationId/rooms'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { accommodationId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rooms_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rooms_controller').default['index']>>>
    }
  }
  'rooms.store': {
    methods: ["POST"]
    pattern: '/accommodations/:accommodationId/rooms'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/room').createRoomValidator)>>
      paramsTuple: [ParamValue]
      params: { accommodationId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/room').createRoomValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rooms_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rooms_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'rooms.update': {
    methods: ["PUT"]
    pattern: '/rooms/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/room').updateRoomValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/room').updateRoomValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rooms_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rooms_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'rooms.destroy': {
    methods: ["DELETE"]
    pattern: '/rooms/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rooms_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rooms_controller').default['destroy']>>>
    }
  }
  'assignments.store': {
    methods: ["POST"]
    pattern: '/assignments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments_controller').default['store']>>>
    }
  }
  'assignments.move_out': {
    methods: ["PATCH"]
    pattern: '/assignments/:id/move-out'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments_controller').default['moveOut']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments_controller').default['moveOut']>>>
    }
  }
  'payments.pending': {
    methods: ["GET","HEAD"]
    pattern: '/payments/pending'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['pending']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['pending']>>>
    }
  }
  'payments.verify': {
    methods: ["PATCH"]
    pattern: '/payments/:id/verify'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['verify']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['verify']>>>
    }
  }
  'reports.occupancy': {
    methods: ["GET","HEAD"]
    pattern: '/reports/occupancy'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['occupancy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['occupancy']>>>
    }
  }
  'reports.application_trends': {
    methods: ["GET","HEAD"]
    pattern: '/reports/applications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['applicationTrends']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['applicationTrends']>>>
    }
  }
  'admin_verifications.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/pending'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_verifications_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_verifications_controller').default['index']>>>
    }
  }
  'admin_verifications.verify': {
    methods: ["PATCH"]
    pattern: '/admin/users/:userId/verify'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { userId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_verifications_controller').default['verify']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_verifications_controller').default['verify']>>>
    }
  }
  'admin_settings.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_settings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_settings_controller').default['index']>>>
    }
  }
  'admin_settings.update': {
    methods: ["PUT"]
    pattern: '/admin/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_settings_controller').default['update']>>>
    }
  }
  'logs.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/logs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/logs_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/logs_controller').default['index']>>>
    }
  }
  'admin_settings.count_users': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/count'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_settings_controller').default['countUsers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_settings_controller').default['countUsers']>>>
    }
  }
}
