/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { ROLES } from '../app/constants/roles.ts'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import AccommodationController from '#controllers/accommodation_controller'

router.get('/', () => {
  return { status: 'USAT API is running - Sprint 03 Launch' }
})

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (Guest-Accessible)
|--------------------------------------------------------------------------
*/

router.group(() => {
  router.get('/auth/google/redirect', [controllers.Auth, 'redirect'])
  router.get('/auth/google/callback', [controllers.Auth, 'callback'])
  
  // Map Viewer Data
  router.get('/accommodations', [controllers.Accommodation, 'index'])
  router.get('/accommodations/:id', [controllers.Accommodation, 'show'])

  // [SPRINT 03] Reviews (Publicly visible)
  // router.get('/accommodations/:id/reviews', [controllers.Reviews, 'index'])
})

/*
|--------------------------------------------------------------------------
| PROTECTED API ROUTES (Requires Auth)
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    // ─── SUCCESSFUL LOGIN/SIGNUP ───
    router.get('/me', [controllers.Auth, 'me'])

    // ─── USER ONBOARDING ───
    router.get('/setup', [controllers.Setups, 'show'])
    router.post('/setup', [controllers.Setups, 'store'])
    // router.post('/auth/verify-sms', [controllers.SmsVerifications, 'verify']) // [SPRINT 03]

    // ====================================================================
    // ─── STUDENT ROUTES ───
    // ====================================================================
    router
      .group(() => {
        // Application & Stay
        // router.post('/applications', [controllers.Applications, 'store'])
        // router.get('/applications/my-applications', [controllers.Applications, 'index'])
        // router.get('/my-stay/current', [controllers.Assignments, 'currentStay'])
        // router.get('/my-stay/history', [controllers.Assignments, 'stayHistory'])
        
        // Bookmarks & Reviews
        // router.post('/accommodations/:id/bookmarks', [controllers.Bookmarks, 'toggle'])
        // router.get('/my-bookmarks', [controllers.Bookmarks, 'index'])
        // router.post('/accommodations/:id/reviews', [controllers.Reviews, 'store'])
        
        // Fees & Payments
        // router.get('/my-fees', [controllers.Fees, 'index'])
        // router.post('/payments/:feeId/pay', [controllers.Payments, 'uploadProof'])
        // router.get('/my-payments', [controllers.Payments, 'getStudentPaymentHistory'])
    }).use(middleware.role([ROLES.STUDENT]))

    // ====================================================================
    // ─── LANDLORD EXCLUSIVE ROUTES ───
    // ====================================================================
    router
      .group(() => {
        // Reporting & Analytics
        router.get('/reports/revenue', [controllers.Reports, 'revenue'])
        router.get('/reports/delinquency', [controllers.Reports, 'delinquency'])
      })
      .use(middleware.role([ROLES.LANDLORD]))

      // Manager Handover
        //router.post('/landlord/accommodations/:id/freeze', [controllers.ManagerHandover, 'freeze'])
        //router.post('/landlord/accommodations/:id/unfreeze', [controllers.ManagerHandover, 'unfreeze'])
        //router.get('/landlord/accommodations/:id/freeze-status', [controllers.ManagerHandover, 'status'])


    // ====================================================================
    // ─── SHARED MANAGER & LANDLORD ROUTES ───
    // ====================================================================
    router
      .group(() => {
        // Application Review
        router.get('/applications/incoming', [controllers.Application, 'incoming'])
        router.patch('/applications/:id/review', [controllers.Application, 'updateStatus'])

        // Room Management
        // router.get('/accommodations/:accommodationId/rooms', [controllers.Rooms, 'index'])
        // router.post('/accommodations/:accommodationId/rooms', [controllers.Rooms, 'store'])
        // router.put('/rooms/:id', [controllers.Rooms, 'update'])
        // router.delete('/rooms/:id', [controllers.Rooms, 'destroy'])

        // Room Assignments & Move-outs
        // router.post('/assignments', [controllers.Assignments, 'store'])
        // router.patch('/assignments/:id/move-out', [controllers.Assignments, 'moveOut'])

        // Payment Verification
        // router.get('/payments/pending', [controllers.Payments, 'pending'])
        // router.patch('/payments/:id/verify', [controllers.Payments, 'verify'])

        // Reports
        router.get('/reports/occupancy', [controllers.Reports, 'occupancy'])
        router.get('/reports/applications', [controllers.Reports, 'applicationTrends'])

        // Document Zip Export (Backblaze)
        router.get('/accommodations/:id/export-documents', [
          AccommodationController,
          'exportDocuments',
        ])
      })
      .use(middleware.role([ROLES.MANAGER, ROLES.LANDLORD]))

    // ====================================================================
    // ─── ADMIN / SUPER_ADMIN ───
    // ====================================================================
    router
      .group(() => {
        // User Verifications
        router.get('/admin/users/pending', [controllers.AdminVerifications, 'index'])
        router.patch('/admin/users/:userId/verify', [controllers.AdminVerifications, 'verify'])
        
        // System Settings (Academic Year & Semester Updates)
        router.get('/admin/settings', [controllers.AdminSettings, 'index']) 
        router.put('/admin/settings', [controllers.AdminSettings, 'update'])
        
        // System Logs
        // Fixed: Mapped properly to the Logs controller
        router.get('/admin/logs', [controllers.Logs, 'index'])
      })
      .use(middleware.role([ROLES.MANAGER, ROLES.SUPER_ADMIN]))

  })
  .use(middleware.auth())

/*
|--------------------------------------------------------------------------
| DEVELOPMENT & TEST ROUTES
|--------------------------------------------------------------------------
*/
router.get('/swagger', async () => {
  return AutoSwagger.docs(router.toJSON(), swagger)
})
router.get('/docs', async () => {
  return AutoSwagger.ui('/swagger', swagger)
})
