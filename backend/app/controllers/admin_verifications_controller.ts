import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Student from '#models/student'
import Landlord from '#models/landlord'
import NotificationService from '#services/notification_service'

@inject()
export default class AdminVerificationsController {
  constructor(protected notificationService: NotificationService) {}

  // Gets all users waiting for Admin approval
  async index({ response }: HttpContext) {
    // 1. Find all users who are still 'unassigned'
    const users = await User.query().where('role', 'unassigned')

    const pendingUsers = []

    for (const user of users) {
      // 2. Check if they submitted the setup form
      const student = await Student.findBy('userId', user.id)
      const landlord = await Landlord.findBy('userId', user.id)

      // 3. Only add them to the list if they actually submitted their details
      if (student || landlord) {
        pendingUsers.push({
          user,
          requestedRole: student ? 'student' : 'landlord',
          profileDetails: student || landlord,
        })
      }
    }

    return response.ok(pendingUsers)
  }

  // Approves the user by changing their role
  async verify({ request, params, response }: HttpContext) {
    const { roleToAssign } = request.all() // 'student' or 'landlord'

    // Note: the route says :userId, so we use params.userId here
    const user = await User.findOrFail(params.userId)

    user.role = roleToAssign
    user.accountStatus = 'active' // Automatically activate their account once verified
    await user.save()

    await this.notificationService.sendAccountApprovedEmail(user, roleToAssign)

    return response.ok(user)
  }
}
