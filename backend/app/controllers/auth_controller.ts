import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProvisioningService from '#services/provisioning_service'
import NotificationService from '#services/notification_service'

@inject()
export default class AuthController {
  constructor(
    protected provisioningService: ProvisioningService,
    protected notificationService: NotificationService
  ) {}

  // STEP 1: Redirect user to Google login screen
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  // STEP 2: Handle response from Google
  async callback({ ally, auth, response }: HttpContext) {
    const google = ally.use('google')

    // Handle errors before fetching the user
    if (google.accessDenied()) return 'Access was denied'
    if (google.stateMisMatch()) return 'Request expired. Retry again'
    if (google.hasError()) return google.getError()

    // Fetch the user data from Google
    const googleUser = await google.user()

    // Provision the user (check if exists, if not create with unassigned role)
    // If Super Admin, it will just return the existing seeded account
    const user = await this.provisioningService.provision({
      email: googleUser.email,
      fname: googleUser.original.given_name,
      lname: googleUser.original.family_name,
    })

    // Log the user in
    await auth.use('web').login(user)

    // Redirect to frontend link and let them deal with the role-based redirect lol
    return response.redirect('http://localhost:3000/auth/success')
  }
}
