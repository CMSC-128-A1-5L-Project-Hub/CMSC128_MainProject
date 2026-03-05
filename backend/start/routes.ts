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

// This triggers STEP 1 method
router.get('/auth/google/redirect', [AuthController, 'redirect'])

// This triggers STEP 2 method (Google will send the user here)
router.get('/auth/google/callback', [AuthController, 'callback'])


router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessToken, 'store'])
        router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    /*
    |--------------------------------------------------------------------------
    | SETUP ROUTES (for unassigned users)
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/', [controllers.Setups, 'show'])
        router.post('/', [controllers.Setups, 'store'])
      })
      .prefix('setup')
      .use(middleware.auth())

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD ROUTES
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/student', [controllers.StudentDashboards, 'index'])
          .use(middleware.role(['student' ]))

        router.get('/landlord', [controllers.LandlordDashboards, 'index'])
          .use(middleware.role(['landlord' ]))
      })
      .prefix('dashboard')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/profile', [controllers.Profile, 'show'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())
  })
  .prefix('/api/v1')

  // ── RBAC Test Routes ───────────────────────────────
router.get('/test-set-role/:role', async ({ session, params }) => {
  session.put('role', params.role)
  return { message: `Role set to: ${params.role}` }
})

router
  .get('/test-student-only', async ({ session }) => {
    return { message: 'Welcome, Student.', role: session.get('role') }
  })
  .use(middleware.role([ROLES.STUDENT]))

router
  .get('/test-manager-only', async ({ session }) => {
    return { message: 'Welcome, Dormitory Manager.', role: session.get('role') }
  })
  .use(middleware.role([ROLES.MANAGER]))

router
  .get('/test-landlord-only', async ({ session }) => {
    return { message: 'Welcome, Landlord.', role: session.get('role') }
  })
  .use(middleware.role([ROLES.LANDLORD]))

router
  .get('/test-landlord-manager', async ({ session }) => {
    return { message: 'Welcome, housing personnel.', role: session.get('role') }
  })
  .use(middleware.role([ROLES.LANDLORD, ROLES.MANAGER]))
