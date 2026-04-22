/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { ROLES } from '../app/constants/roles.ts'
import { throttle } from '#start/limiter'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
const InviteManagerController = () => import('#controllers/invite_manager_controller')
import { uploadThrottle } from '#start/limiter'
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
    router.put('/me', [controllers.Auth, 'updateMe'])

    // ─── USER ONBOARDING ───
    router.get('/setup', [controllers.Setups, 'show'])
    router.post('/setup', [controllers.Setups, 'store'])

    // ─── SMS OTP ───
    router.post('/auth/verify-sms', [controllers.SmsVerifications, 'verify'])
    router.post('/auth/send-otp', [controllers.SmsVerifications, 'send']).use(throttle)

    // ====================================================================
    // ─── STUDENT ROUTES ───
    // ====================================================================
    router
      .group(() => {
        // Application & Stay
        router.post('/applications', [controllers.Application, 'store'])
        router.get('/applications/my-applications', [controllers.Application, 'index'])
        router.get('/my-stay/current', [controllers.Assignments, 'currentStay'])
        router.get('/my-stay/history', [controllers.Assignments, 'stayHistory'])

        // Bookmarks & Reviews
        router.post('/accommodations/:id/bookmarks', [controllers.Bookmark, 'toggle'])
        router.get('/my-bookmarks', [controllers.Bookmark, 'index'])
        router.post('/accommodations/:id/reviews', [controllers.Reviews, 'store'])

        // Fees & Payments
        router.get('/my-fees', [controllers.Fees, 'index'])
        router.post('/payments/:feeId/pay', [controllers.Payments, 'uploadProof'])
        router.get('/my-payments', [controllers.Payments, 'getStudentPaymentHistory'])

        // Student Profile
        router.get('/student/profile', [controllers.StudentProfiles, 'show'])

        // recommended accommodations
        router.get('/recommended-accommodations', [controllers.Accommodation, 'recommended'])
    }).use(middleware.role([ROLES.STUDENT]))

    // ====================================================================
    // ─── LANDLORD EXCLUSIVE ROUTES ───
    // ====================================================================
    router
      .group(() => {
        // Reporting & Analytics
        router.get('/reports/revenue', [controllers.Reports, 'revenue'])
        router.get('/reports/delinquency', [controllers.Reports, 'delinquency'])

        // Accommodation Management
        router.get('/landlord/accommodations', [controllers.Accommodation, 'landlordIndex'])
        router.post('/landlord/accommodations', [controllers.Accommodation, 'store']).use(middleware.auth()).use(uploadThrottle)
        router.put('/landlord/accommodations/:id', [controllers.Accommodation, 'update'])
        router.post('/landlord/accommodations/:id/images', [controllers.Accommodation, 'uploadImages'])
        router.delete('/landlord/accommodations/:id/images/:imageId', [controllers.Accommodation, 'deleteImage'])

        // Manager Handover
        router.post('/landlord/accommodations/:id/freeze', [controllers.ManagerHandover, 'freeze'])
        router.post('/landlord/accommodations/:id/unfreeze', [controllers.ManagerHandover, 'unfreeze'])
        router.get('/landlord/accommodations/:id/freeze-status', [controllers.ManagerHandover, 'status'])

        // Invite Manager
        router.post('/landlord/accommodations/:id/invite-manager', [InviteManagerController, 'invite'])      })
      .use(middleware.role([ROLES.LANDLORD]))

    // ====================================================================
    // ─── SHARED MANAGER & LANDLORD ROUTES ───
    // ====================================================================
    router
      .group(() => {
        // Application Review
        router.get('/applications/incoming', [controllers.Application, 'incoming'])
        router.patch('/applications/:id/review', [controllers.Application, 'updateStatus'])

        // Room Management
        router.get('/accommodations/:accommodationId/rooms', [controllers.Rooms, 'index'])
        router.post('/accommodations/:accommodationId/rooms', [controllers.Rooms, 'store'])
        router.put('/rooms/:id', [controllers.Rooms, 'update'])
        router.delete('/rooms/:id', [controllers.Rooms, 'destroy'])

        // Room Assignments & Move-outs
        router.post('/assignments', [controllers.Assignments, 'store'])
        router.patch('/assignments/:id/move-out', [controllers.Assignments, 'moveOut'])

        // Payment Verification
        router.get('/payments/pending', [controllers.Payments, 'pending'])
        router.patch('/payments/:id/verify', [controllers.Payments, 'verify'])

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
        router.get('/admin/logs', [controllers.Logs, 'index'])

        router.get('/admin/users/count', [controllers.AdminSettings, 'countUsers'])
        router.get('/admin/rooms/available/count', [controllers.Rooms, 'countAvailableRooms'])

        // Accommodation Verifications
        router.get('/admin/accommodations/pending', [controllers.AdminAccommodations, 'index'])
        router.patch('/admin/accommodations/:id/verify', [controllers.AdminAccommodations, 'verify'])
      })
      .use(middleware.role([ROLES.MANAGER, ROLES.SUPER_ADMIN]))

      /// ====================================================================
      // ─── MANAGER ───
      // ====================================================================

      router.get('/manager/profile', [controllers.ManagerProfiles, 'show'])
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

// Notfications
router.get('/notifications', [controllers.Notifications, 'index'])
router.patch('/notifications/:id', [controllers.Notifications, 'update'])

// Student Applications
// router.get('/applications/my-applications', [controllers.Application, 'index'])