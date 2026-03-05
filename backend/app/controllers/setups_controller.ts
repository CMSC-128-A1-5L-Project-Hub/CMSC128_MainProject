import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class SetupController {
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
    const role = request.input('role')

    user.role = role
    await user.save()

    return response.json({
      message: 'Role assigned successfully',
      role: user.role,
    })
  }
}