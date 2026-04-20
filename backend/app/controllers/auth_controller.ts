import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProvisioningService from '#services/provisioning_service'
import NotificationService from '#services/notification_service'
import LogService from '#services/log_service'

@inject()
export default class AuthController {
  constructor(
    protected provisioningService: ProvisioningService,
    protected notificationService: NotificationService,
    protected logService: LogService
  ) {}

  // STEP 1: Redirect user to Google login screen
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  // STEP 2: Handle response from Google
 async callback({ ally, auth, response, session }: HttpContext) {
  const google = ally.use('google')

  if (google.accessDenied()) return 'Access was denied'
  if (google.stateMisMatch()) return 'Request expired. Retry again'
  if (google.hasError()) return google.getError()

  const googleUser = await google.user()

  const user = await this.provisioningService.provision({
    email: googleUser.email,
    fname: googleUser.original.given_name,
    lname: googleUser.original.family_name,
  })

  await auth.use('web').login(user)

  // Set role in session so RoleMiddleware can read it
  session.put('role', user.role)

  await LogService.logAuthActivity(user, 'logged_in')

  switch (user.role) {
    case 'landlord':
      return response.redirect('http://localhost:5173/landlord/manage/accommodation')
    case 'student':
      return response.redirect('http://localhost:5173/studentDashboard')
    case 'manager':
      return response.redirect('http://localhost:5173/manager/dashboard')
    case 'super_admin':
      return response.redirect('http://localhost:5173/admin/dashboard')
    default:
      return response.redirect('http://localhost:5173/auth/role')
  }
}

  // ─── GET /me ──────────────────────────────────────────────────────────────
  async me({ auth, serialize }: HttpContext) {
    const user = auth.user!
    console.log("User logged in! here's their info: ", user.toJSON())
    return serialize(user.serialize())
  }
}