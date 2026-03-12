/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { ROLES } from '../app/constants/roles.ts'
import ProvisioningService from '../app/services/provisioning_service.js'
import app from '@adonisjs/core/services/app'

const NotificationService = () => import('#services/notification_service')
const AuthController = () => import('#controllers/auth_controller')

router.get('/', () => {
  return { hello: 'world' }
})

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (Guest-Accessible)
|--------------------------------------------------------------------------
*/

// removed the prefix /api/v1 for now
router.group(() => {
  // Authentication Entry Points
  router.get('/auth/google/redirect', [AuthController, 'redirect'])
  router.get('/auth/google/callback', [AuthController, 'callback'])

  // The Dorm Map/Viewer
  // router.get('/accommodations', [controllers.Accommodations, 'index'])
  // router.get('/accommodations/:id', [controllers.Accommodations, 'show'])
})

/*
|--------------------------------------------------------------------------
| PROTECTED API ROUTES (Requires Auth)
|--------------------------------------------------------------------------
*/
router.group(() => {
  
  // Dashboard & Profile Routes
  router.group(() => {
    router.get('/student', [controllers.StudentDashboards, 'index'])
      .use(middleware.role([ROLES.STUDENT]))

    router.get('/landlord', [controllers.LandlordDashboards, 'index'])
      .use(middleware.role([ROLES.LANDLORD]))
    
  }).prefix('dashboard')

  // router.get('/account/profile', [controllers.Profile, 'show'])

  // Setup for new users
  router.post('/setup', [controllers.Setups, 'store'])

}).prefix('/api/v1').use(middleware.auth())


  // ── RBAC Test Routes ───────────────────────────────
router.get('/test-set-role/:role', async ({ session, params }) => {
  session.put('role', params.role)
  return { message: `Role set to: ${params.role}` }
})

router.get('/test-student-only', async ({ session }) => {
  return { message: 'Welcome, Student.', role: session.get('role') }
}).use(middleware.role([ROLES.STUDENT]))

// hi! i added this to test the provisioning service lang, feel free to remove this
// tho dito ko sinama yung auth.login part kasi wala daw dapat siya sa services, pa-note
// na lang when removing -joy

router.get('/test-provision', async ({ auth }) => {
  const service = new ProvisioningService()

  const user = await service.provision({
    email: 'testuser@example.com',
    firstName: 'Test',
    lastName: 'User'
  })

  await auth.use('web').login(user) // auth.login(user) here

  return {
    message: 'User successfully logged in!',
    user: user
  }
})


// Email test route
// router.get('/test-email', async ({ response }) => {
//   try {
//     const service = await app.container.make(await NotificationService())
    
//     const testUser = { 
//       email: 'joshua@example.com', 
//       firstName: 'Joshua' 
//     }

//     await service.sendVerificationOTP(testUser as any, '123456')

//     return 'Sent email to mailtrap'
//   } catch (error) {

//     console.error('MAIL_ERROR:', error)
//     return response.internalServerError({ 
//       message: 'Failed to send', 
//       error: error.message 
//     })
//   }
// })