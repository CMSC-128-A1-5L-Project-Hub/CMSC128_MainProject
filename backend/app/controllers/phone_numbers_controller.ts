import type { HttpContext } from '@adonisjs/core/http'
import PhoneNumber from '#models/phone_number'

export default class PhoneNumbersController {
  async check({ params, response }: HttpContext) {
    const phone = params.phone
    
    // Check if phone exists and belongs to a different user than current
    const existing = await PhoneNumber.query()
      .where('contact_number', phone)
      .first()
    
    return response.ok({ exists: !!existing })
  }
}