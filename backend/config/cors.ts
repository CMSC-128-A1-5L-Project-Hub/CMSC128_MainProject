import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,

  origin: app.inDev
    ? true
    : [env.get('FRONTEND_URL')],

  /**
   * HTTP methods accepted for cross-origin requests.
   */
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Reflect request headers by default. Use a string array to restrict
   * allowed headers.
   */
  headers: true,

  /**
   * Response headers exposed to the browser.
   */
  exposeHeaders: [],

  /**
   * Allow cookies/authorization headers on cross-origin requests.
   */
  credentials: true,

  /**
   * Cache CORS preflight response for N seconds.
   */
  maxAge: 90,
})

export default corsConfig
