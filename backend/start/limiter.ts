/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('global', () => {
<<<<<<< HEAD
  return limiter.allowRequests(1).every('1 minute').blockFor('30 mins')
=======
  return limiter.allowRequests(100).every('1 minute')
})

export const uploadThrottle = limiter.define('upload', () => {
  return limiter.allowRequests(5).every('1 minute')
})

export const authThrottle = limiter.define('auth', () => {
  return limiter.allowRequests(10).every('1 minute')
>>>>>>> 30418d0b28c95424c41e997750c2bd267e474791
})