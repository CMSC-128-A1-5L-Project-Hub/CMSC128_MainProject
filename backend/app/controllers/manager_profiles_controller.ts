// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import Manager from '#models/manager'
import Accommodation from '#models/accommodation'

export default class ManagerProfileController {
  async show({ auth, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const manager = await Manager.query()
      .where('userId', user.id)
      .first()

    if (!manager) {
      return response.notFound({ message: 'Manager profile not found' })
    }

    const accommodation = await Accommodation.query()
      .where('manager_id', user.id)
      .first()

    return response.ok({
      fullName: `${user.fname ?? ''} ${user.lname ?? ''}`.trim(),
      upMail: user.email ?? '',
      facebook: user.facebookAccount ?? '',
      phone: '',
      employer: '',
      altPhone: '',
      verifiedSince: manager.managerStatus === 'active' ? 'Verified' : 'Pending',
      currentDorm: accommodation?.accommodationName ?? 'No assigned dorm yet',
      dormMeta: accommodation?.accommodationType ?? '',
    })
  }
}