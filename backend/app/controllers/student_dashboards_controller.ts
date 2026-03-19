import type { HttpContext } from '@adonisjs/core/http'

export default class StudentDashboardController {
  async index({ response }: HttpContext) {
    return response.json({
      message: 'Welcome to Student Dashboard',
    })
  }
}
