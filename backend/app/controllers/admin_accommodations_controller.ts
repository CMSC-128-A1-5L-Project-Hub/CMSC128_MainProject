import type { HttpContext } from '@adonisjs/core/http'
import Accommodation from '#models/accommodation'

export default class AdminAccommodationsController {

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
    return serialize(accommodation)
  }
}
