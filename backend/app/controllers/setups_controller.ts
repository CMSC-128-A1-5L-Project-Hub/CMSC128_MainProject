import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import ProfileService from '#services/profile_service'
import { setupProfileValidator } from '#validators/profile'

export default class SetupController {
  private profileService = new ProfileService()

  async show({ auth, response }: HttpContext) {
    const user = auth.user as User

    return response.json({
      message: 'Setup required',
      user,
      role: user.role,
    })
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.user as User
    const validatedData = await setupProfileValidator.validate(request.all())

    const result = await this.profileService.setupProfile(user, validatedData)

    return response.json({
      message: 'Profile setup submitted successfully',
      data: result,
    })
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
// is_verified = true
// user.role = Student or Landlord
// (tama ba? hahahaha) - windee 
