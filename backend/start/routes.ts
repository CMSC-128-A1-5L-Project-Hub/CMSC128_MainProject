/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { ROLES } from '../app/constants/roles.ts'
import { throttle, uploadThrottle } from '#start/limiter'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

const InviteManagerController = () => import('#controllers/invite_manager_controller')
import AccommodationController from '#controllers/accommodation_controller'
import ApplicationController from '#controllers/application_controller'
import AssignmentsController from '#controllers/assignments_controller'
import RoomsController from '#controllers/rooms_controller'
import LogsController from '#controllers/logs_controller'
import TransientBookingsController from '#controllers/transient_booking_controller'

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

  router.get('/accommodations', [AccommodationController, 'index'])
  router.get('/accommodations/:id', [AccommodationController, 'show'])
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

    // Notifications
    router.get('/notifications', [controllers.Notifications, 'index'])
    router.patch('/notifications/:id', [controllers.Notifications, 'update'])

    // ====================================================================
    // ─── STUDENT ROUTES ───
    // ====================================================================
    router
      .group(() => {
        // Application & Stay
        router.post('/applications', [ApplicationController, 'store'])
        router.get('/applications/my-applications', [ApplicationController, 'index'])
        router.patch('/applications/:id', [ApplicationController, 'cancel'])
        router.get('/my-stay/current', [AssignmentsController, 'currentStay'])
        router.get('/my-stay/history', [AssignmentsController, 'stayHistory'])
        router.get('/student/profile', [controllers.StudentProfiles, 'show'])

        // Confirm / decline approved slot
        router.post('/applications/:id/confirm', [ApplicationController, 'confirm'])
        // Confirm assignment (student)
        router.post('/assignments/:id/confirm', [ApplicationController, 'confirmAssignment'])

        // Bookmarks & Reviews
        router.post('/accommodations/:id/bookmarks', [controllers.Bookmark, 'toggle'])
        router.get('/my-bookmarks', [controllers.Bookmark, 'index'])
        router.post('/accommodations/:id/reviews', [controllers.Reviews, 'store'])

        // Fees & Payments
        router.get('/my-fees', [controllers.Fees, 'index'])
        router.post('/payments/:feeId/pay', [controllers.Payments, 'uploadProof'])
        router.get('/my-payments', [controllers.Payments, 'getStudentPaymentHistory'])

        // Transient bookings (student)
        router.post('/transient-bookings', [TransientBookingsController, 'store'])
        router.post('/transient-bookings/:id/proof', [TransientBookingsController, 'uploadProof'])
        router.get('/transient-bookings', [TransientBookingsController, 'myBookings'])
      }).use(middleware.role([ROLES.STUDENT]))

    // ====================================================================
    // ─── LANDLORD EXCLUSIVE ROUTES ───
    // ====================================================================
    router
      .group(() => {
        router.get('/reports/revenue', [controllers.Reports, 'revenue'])
        router.get('/reports/delinquency', [controllers.Reports, 'delinquency'])

        router.get('/landlord/accommodations', [AccommodationController, 'landlordIndex'])
        router.post('/landlord/accommodations', [AccommodationController, 'store']).use(middleware.auth()).use(uploadThrottle)
        router.put('/landlord/accommodations/:id', [AccommodationController, 'update'])
        router.post('/landlord/accommodations/:id/images', [AccommodationController, 'uploadImages'])
        router.delete('/landlord/accommodations/:id/images/:imageId', [AccommodationController, 'deleteImage'])

        router.post('/landlord/accommodations/:id/freeze', [controllers.ManagerHandover, 'freeze'])
        router.post('/landlord/accommodations/:id/unfreeze', [controllers.ManagerHandover, 'unfreeze'])
        router.get('/landlord/accommodations/:id/freeze-status', [controllers.ManagerHandover, 'status'])

        router.post('/landlord/accommodations/:id/invite-manager', [InviteManagerController, 'invite'])

        router.patch('/transient-bookings/:id/verify', [TransientBookingsController, 'verify'])
      })
      .use(middleware.role([ROLES.LANDLORD]))

    // ====================================================================
    // ─── SHARED MANAGER & LANDLORD ROUTES ───
    // ====================================================================
    router
      .group(() => {
        router.get('/applications/incoming', [ApplicationController, 'incoming'])
        router.patch('/applications/:id/review', [ApplicationController, 'updateStatus'])
        router.get('/applications/:id/enrollment-proof', [ApplicationController, 'viewEnrollmentProof'])

        router.get('/manager/applications/approved', [ApplicationController, 'approvedForAssignment'])
        router.get('/manager/assignments', [AssignmentsController, 'managerIndex'])
        router.get('/manager/rooms', [RoomsController, 'managerRooms'])
        router.get('/manager/logs', [LogsController, 'managerLogs'])

        router.get('/accommodations/:accommodationId/rooms', [RoomsController, 'index'])
        router.post('/accommodations/:accommodationId/rooms', [RoomsController, 'store'])
        router.put('/rooms/:id', [RoomsController, 'update'])
        router.delete('/rooms/:id', [RoomsController, 'destroy'])
        router.post('/rooms/:id/report-issue', [RoomsController, 'reportIssue'])

        router.post('/assignments', [AssignmentsController, 'store'])
        router.patch('/assignments/:id/move-out', [AssignmentsController, 'moveOut'])

        router.get('/payments/pending', [controllers.Payments, 'pending'])
        router.patch('/payments/:id/verify', [controllers.Payments, 'verify'])

        router.get('/reports/occupancy', [controllers.Reports, 'occupancy'])
        router.get('/reports/applications', [controllers.Reports, 'applicationTrends'])

        router.get('/accommodations/:id/export-documents', [AccommodationController, 'exportDocuments'])
      })
      .use(middleware.role([ROLES.MANAGER, ROLES.LANDLORD]))

    // ====================================================================
    // ─── ADMIN / SUPER_ADMIN ───
    // ====================================================================
    router
      .group(() => {
        router.get('/admin/users/pending', [controllers.AdminVerifications, 'index'])
        router.patch('/admin/users/:userId/verify', [controllers.AdminVerifications, 'verify'])

        router.get('/admin/settings', [controllers.AdminSettings, 'index'])
        router.put('/admin/settings', [controllers.AdminSettings, 'update'])

        router.get('/admin/logs', [LogsController, 'index'])

        router.get('/admin/users/count', [controllers.AdminSettings, 'countUsers'])
        router.get('/admin/rooms/available/count', [RoomsController, 'countAvailableRooms'])

        router.get('/admin/accommodations/pending', [controllers.AdminAccommodations, 'index'])
        router.patch('/admin/accommodations/:id/verify', [controllers.AdminAccommodations, 'verify'])
      })
      .use(middleware.role([ROLES.MANAGER, ROLES.SUPER_ADMIN]))
  })
  .use(middleware.auth())

router.get('/swagger', async () => {
  return AutoSwagger.docs(router.toJSON(), swagger)
})
router.get('/docs', async () => {
  return AutoSwagger.ui('/swagger', swagger)
})