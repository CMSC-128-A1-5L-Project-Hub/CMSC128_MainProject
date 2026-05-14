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
import { uploadThrottle } from '#start/limiter'

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
  router.get('/accommodations/:id/reviews', [controllers.Reviews, 'index'])

    // Landing Page
    router.get('/settings', [controllers.AdminSettings, 'index'])
    .as('public_settings.index')

    router.get('/rooms/available/count', [controllers.Rooms, 'countAvailableRooms'])
    .as('public_rooms_available_count')

    router.get('/occupancy/dorms', [controllers.OccupancyRecords, 'publicDormOccupancy'])

    router.get('/accommodations/top-rated', [controllers.Accommodation, 'topRated'])
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
    router.post('/me/profile-picture', [controllers.Auth, 'uploadProfilePicture']).use(uploadThrottle)
    router.post('/logout', [controllers.Auth, 'logout'])

    // ─── USER ONBOARDING ───
    router.get('/setup', [controllers.Setups, 'show'])
    router.post('/setup', [controllers.Setups, 'store'])

    // ─── SMS OTP ───
    router.post('/auth/verify-sms', [controllers.SmsVerifications, 'verify'])
    router.post('/auth/send-otp', [controllers.SmsVerifications, 'send']).use(throttle)

    // Notfications
    router.get('/notifications', [controllers.Notifications, 'index'])
    router.patch('/notifications/:id', [controllers.Notifications, 'update'])

    // ====================================================================
    // ─── STUDENT ROUTES ───
    // ====================================================================
    router
      .group(() => {
        // Application & Stay
        router.post('/applications', [controllers.Application, 'store'])
        router.get('/applications/my-applications', [controllers.Application, 'index'])
        router.patch('/applications/:id', [controllers.Application, 'cancel'])
        router.post('/applications/:id/confirm', [controllers.Application, 'confirm'])
        router.post('/applications/:id/confirm-slot', [controllers.Application, 'confirmSlot'])
        router.post('/assignments/:id/confirm', [controllers.Application, 'confirmAssignment'])
        router.get('/my-stay/current', [controllers.Assignments, 'currentStay'])
        router.get('/my-stay/history', [controllers.Assignments, 'stayHistory'])
        router.get('/student/profile', [controllers.StudentProfiles, 'show'])

        // Bookmarks & Reviews
        router.post('/accommodations/:id/bookmarks', [controllers.Bookmark, 'toggle'])
        router.get('/my-bookmarks', [controllers.Bookmark, 'index'])
        router.post('/accommodations/:id/reviews', [controllers.Reviews, 'store'])
        router.get('/recommended-accommodations', [controllers.Accommodation, 'recommended'])

        // Fees & Payments
        router.get('/my-fees', [controllers.Fees, 'index'])
        router.post('/payments/:feeId/pay', [controllers.Payments, 'uploadProof'])
        router.get('/my-payments', [controllers.Payments, 'getStudentPaymentHistory'])

        // Transient bookings (student)
        router.post('/transient-bookings', [controllers.TransientBooking, 'store'])
        router.post('/transient-bookings/:id/proof', [controllers.TransientBooking, 'uploadProof'])
        router.get('/transient-bookings', [controllers.TransientBooking, 'myBookings'])
        router.post('/issue-reports', [controllers.IssueReports, 'store'])
        
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

        // ─── FEES (CREATED BY LANDLORD) ───
        router.post('/fees', [controllers.Fees, 'store'])
        router.post('/landlord/fees/bulk', [controllers.Fees, 'bulkStore'])

        // ─── ROOM ISSUES (LANDLORD VIEW + RESOLVE) ───
        router.get('/landlord/room-issues', [controllers.Rooms, 'listIssues'])
        router.patch('/room-issues/:id/resolve', [controllers.Rooms, 'resolveIssue'])

        // Manager Handover
        router.post('/landlord/accommodations/:id/freeze', [controllers.ManagerHandover, 'freeze'])
        router.post('/landlord/accommodations/:id/unfreeze', [controllers.ManagerHandover, 'unfreeze'])
        router.get('/landlord/accommodations/:id/freeze-status', [controllers.ManagerHandover, 'status'])

        // Invite Manager
        router.post('/landlord/accommodations/:id/invite-manager', [controllers.InviteManager, 'invite'])

        // Transient booking verification (landlord)
        router.patch('/transient-bookings/:id/verify', [controllers.TransientBooking, 'verify'])

        // Profile
        router.get('/landlord/profile', [controllers.LandlordProfiles, 'show'])
        router.patch('/landlord/profile', [controllers.LandlordProfiles, 'update'])
      })
      .use(middleware.role([ROLES.LANDLORD]))

    // ====================================================================
    // ─── SHARED MANAGER & LANDLORD ROUTES ───
    // ====================================================================
    router
      .group(() => {
        // Application Review
        router.get('/applications/incoming', [controllers.Application, 'incoming'])
        router.get('/applications/view-applicants', [controllers.Application, 'viewApplicants'])
        router.get('/applications/view-all-applicants', [controllers.Application, 'viewApplications'])
        router.get('/applications/view-waitlisted', [controllers.Application, 'viewWaitlisted'])
        router.get('/applications/view-all-waitlisted', [controllers.Application, 'viewAllWaitlisted'])
        router.patch('/applications/:id/review', [controllers.Application, 'updateStatus'])
        router.get('/applications/:id/enrollment-proof', [controllers.Application, 'viewEnrollmentProof'])
        router.get('/manager/applications/approved', [controllers.Application, 'approvedForAssignment'])

        // Manager dashboard
        router.get('/manager/assignments', [controllers.Assignments, 'managerIndex'])
        router.get('/manager/rooms', [controllers.Rooms, 'managerRooms'])
        router.get('/manager/logs', [controllers.Logs, 'managerLogs'])

        // Room Management
        router.get('/accommodations/:accommodationId/rooms', [controllers.Rooms, 'index'])
        router.post('/accommodations/:accommodationId/rooms', [controllers.Rooms, 'store'])
        router.put('/rooms/:id', [controllers.Rooms, 'update'])
        router.delete('/rooms/:id', [controllers.Rooms, 'destroy'])
        router.post('/rooms/:id/report-issue', [controllers.Rooms, 'reportIssue'])

        // Room Assignments & Move-outs
        router.get('/view-all-assignments', [controllers.Assignments, 'viewAllAssignments'])
        router.get('/view-assignments', [controllers.Assignments, 'viewAssignments'])
        router.post('/assignments', [controllers.Assignments, 'store'])
        router.patch('/assignments/:id/move-out', [controllers.Assignments, 'moveOut'])
        router.patch('/assignments/:id/transfer', [controllers.Assignments, 'transfer'])

        // Payment Verification
        router.get('/payments/pending', [controllers.Payments, 'pending'])
        router.patch('/payments/:id/verify', [controllers.Payments, 'verify'])
        router.get('/fees/overdue', [controllers.Fees, 'overdueForManager'])

        // Reports
        router.get('/reports/occupancy', [controllers.Reports, 'occupancy'])
        router.get('/reports/applications', [controllers.Reports, 'applicationTrends'])

        // Document Zip Export (Backblaze)
        router.get('/accommodations/:id/export-documents', [
          controllers.Accommodation,
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
        router.patch('/admin/users/:userId/reject', [controllers.AdminVerifications, 'reject'])

        // System Settings (Academic Year & Semester Updates)
        router.get('/admin/settings', [controllers.AdminSettings, 'index'])
        router.put('/admin/settings', [controllers.AdminSettings, 'update'])

        // System Logs
        router.get('/admin/logs', [controllers.Logs, 'index'])

        router.get('/admin/users/count', [controllers.AdminSettings, 'countUsers'])
        router.get('/admin/facilities/count', [controllers.AdminSettings, 'countFacilities'])
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
      router.patch('/manager/profile', [controllers.ManagerProfiles, 'update'])
      router.get('/manager/occupancy-records', [controllers.OccupancyRecords, 'rooms'])
      router.get('/manager/occupancy-history', [controllers.OccupancyRecords, 'history'])
  })
  .use(middleware.auth())


// ====================================================================
// DEV ROUTES
// ====================================================================
// if (process.env.NODE_ENV === 'development') {
  router.get('/dev/login', [controllers.Auth, 'devLogin'])
// }