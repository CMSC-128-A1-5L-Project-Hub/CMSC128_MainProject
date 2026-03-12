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
import AutoSwagger from 'adonis-autoswagger'
import swagger from "#config/swagger"

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

  // Admin verification
  router.patch('/admin/users/:userId/verify', [controllers.AdminVerifications, 'verify'])
    .use(middleware.role([ROLES.MANAGER]))

}).prefix('/api/v1').use(middleware.auth())



















/*

BUNCHA TEST ROUTES DOWN HERE. REMOVE LATER

*/
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

// Autoswagger test route (AUTOSWAGGER IS FOR TESTING THE ROUTES. just check out localhost:3333/docs to see it)
router.get("/swagger", async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger);
});

router.get("/docs", async () => {
  return AutoSwagger.default.ui("/swagger", swagger);
  // return AutoSwagger.default.scalar("/swagger"); to use Scalar instead. If you want, you can pass proxy url as second argument here.
  // return AutoSwagger.default.rapidoc("/swagger", "view"); to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
});

// testing email function
router.get('/test-otp', async ({ response }) => {
  const { default: NotificationService } = await import('#services/notification_service')
  const service = new NotificationService()

  // Make a user
  const mockUser = { 
    email: 'joshua@test.com', 
    firstName: 'Joshua' 
  }

  try {
    await service.sendVerificationOTP(mockUser as any, '123456')
    return "Please work"
  } catch (error) {
    return response.internalServerError({ message: 'Service failed', error: error.message })
  }
})