import type { HttpContext } from '@adonisjs/core/http'

export default class LandlordDashboardController {
  async index({ response }: HttpContext) {
    return response.json({
      message: 'Welcome to Landlord Dashboard',
    })
  }
}