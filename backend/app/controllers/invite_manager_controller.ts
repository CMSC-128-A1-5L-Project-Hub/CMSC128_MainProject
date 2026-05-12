import type { HttpContext } from '@adonisjs/core/http'
import Accommodation from '#models/accommodation'
import User from '#models/user'
import NotificationService from '#services/notification_service'
import { inject } from '@adonisjs/core'

@inject()
export default class InviteManagerController {
  constructor(protected notificationService: NotificationService) {}

  // POST /landlord/accommodations/:id/invite-manager
  async invite({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const { manager_email } = request.body()

    if (!manager_email) {
      return response.badRequest({
        status: 400,
        error: 'Validation Error',
        message: 'manager_email is required.',
      })
    }

    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .where('landlord_id', user.id)
      .preload('landlord', (q) => q.preload('user'))
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or does not belong to you.',
      })
    }

    const landlordName = `${user.fname} ${user.lname}`

    const existingUser = await User.findBy('email', manager_email)
    if (existingUser) {
      return response.badRequest({
        status: 400,
        error: 'Bad Request',
        message:
          'This account is already registered under a different role. Please use a fresh email.',
      })
    }

    accommodation.invitedManagerEmail = manager_email
    await accommodation.save()

    await this.notificationService.sendManagerInvitationEmail(
      manager_email,
      accommodation.accommodationName,
      landlordName
    )

    return response.ok({
      status: 200,
      message: 'Invitation sent. Manager will be auto-assigned upon sign-in.',
      assigned: false,
    })
  }
}