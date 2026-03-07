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

const AuthController = () => import('#controllers/auth_controller')

router.get('/', () => {
  return { hello: 'world' }
})

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (Guest-Accessible)
|--------------------------------------------------------------------------
*/
router.group(() => {
  // Authentication Entry Points
  router.get('/auth/google/redirect', [AuthController, 'redirect'])
  router.get('/auth/google/callback', [AuthController, 'callback'])

  // The Dorm Map/Viewer
  // router.get('/accommodations', [controllers.Accommodations, 'index'])
  // router.get('/accommodations/:id', [controllers.Accommodations, 'show'])
}).prefix('/api/v1')

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

  router.get('/account/profile', [controllers.Profile, 'show'])

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