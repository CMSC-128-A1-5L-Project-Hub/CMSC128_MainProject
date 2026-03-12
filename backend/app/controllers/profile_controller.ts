import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async index({ response }: HttpContext) {
    return response.json({
      message: 'Profile endpoint',
    })
  }
}