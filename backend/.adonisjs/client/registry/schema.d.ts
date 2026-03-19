/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput } from '@vinejs/vine/types'

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
    }
  }
  'student_dashboards.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/dashboard/student'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_dashboards_controller').default['index']>>>
    }
  }
  'landlord_dashboards.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/dashboard/landlord'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/landlord_dashboards_controller').default['index']>>>
    }
  }
  'setups.store': {
    methods: ["POST"]
    pattern: '/api/v1/setup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile').setupProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile').setupProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/setups_controller').default['store']>>>
    }
  }
  'admin_verifications.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/users/pending'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_verifications_controller').default['index']>>>
    }
  }
  'admin_verifications.verify': {
    methods: ["PATCH"]
    pattern: '/api/v1/admin/users/:userId/verify'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { userId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_verifications_controller').default['verify']>>>
    }
  }
  'application.incoming': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/applications/incoming'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_controller').default['incoming']>>>
    }
  }
  'application.update_status': {
    methods: ["PATCH"]
    pattern: '/api/v1/applications/:id/review'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_controller').default['updateStatus']>>>
    }
  }
}
