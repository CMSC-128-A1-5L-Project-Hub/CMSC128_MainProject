import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Accommodation from '#models/accommodation'
import NotificationService from '#services/notification_service'

@inject()
export default class AdminAccommodationsController {
  constructor(protected notificationService: NotificationService) {}

  async index({ serialize }: HttpContext) {
    const accommodations = await Accommodation.query()
      .where('status', 'pending')
      .preload('landlord', (q) => q.preload('user'))

    return serialize(accommodations)
  }

  async verify({ params, request, serialize }: HttpContext) {
    const { status } = request.all()
    const accommodation = await Accommodation.findOrFail(params.id)
    accommodation.status = status
    await accommodation.save()

    if (status === 'verified') {
      await accommodation.load('landlord', (q) => q.preload('user'))
      const landlordUser = accommodation.landlord?.user
      if (landlordUser) {
        await this.notificationService.sendAccommodationApprovedEmail(
          landlordUser,
          accommodation.accommodationName
        )
      }
    }

    return serialize(accommodation)
  }
}
