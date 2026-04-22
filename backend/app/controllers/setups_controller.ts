import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import ProfileService from '#services/profile_service'
import { setupProfileValidator } from '#validators/profile'

export default class SetupController {
  private profileService = new ProfileService()

  async show({ auth, serialize }: HttpContext) {
    const user = auth.user as User

    return serialize({
      message: 'Setup required',
      user: user.serialize(),
      role: user.role,
      accountStatus: user.accountStatus,
    })
  }

  async store({ request, auth, serialize }: HttpContext) {
    const user = auth.user as User
    console.log(`[SetupForm] User ${user.id} (${user.email}) submitted setup form for review`)
    try {
      const validatedData = await request.validateUsing(setupProfileValidator)
      const result = await this.profileService.setupProfile(user, validatedData)
      return serialize({ message: 'Success', data: result })
    } catch (error) {
      console.error("SETUP ERROR:", error)
      throw error
    }
  }
}

// what happens: user already has an account (google auth) but no profile, user still "unassigned".
// they fill out the form and submits /setup.
// controller validates the submitted data
// controller passes the data to ProfileService
// ProfileService uploads files and saves profile-related data
// user remains unassigned
// later, admin verifies them
// only then do you update:
// user.role = Student or Landlord
// (tama ba? hahahaha) - windee
