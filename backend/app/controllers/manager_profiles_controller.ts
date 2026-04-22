import type { HttpContext } from '@adonisjs/core/http'
import Manager from '#models/manager'
import Accommodation from '#models/accommodation'
import User from '#models/user'

const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })


export default class ManagerProfileController {
  async show({ auth, response }: HttpContext) {
    const authUser = auth.user

    if (!authUser) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const user = await User.query()
      .where('id', authUser.id)
      .preload('phoneNumbers')
      .first()

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

    const primaryPhone =
      user.phoneNumbers.find((p) => p.isPrimary)?.contactNumber ?? 'NONE'

    const secondaryPhone =
      user.phoneNumbers.find((p) => !p.isPrimary)?.contactNumber ?? 'NONE'

    return response.ok({
      fullName: `${user.fname ?? ''} ${user.lname ?? ''}`.trim(),
      upMail: user.email ?? 'NONE',
      facebook: user.facebookAccount ?? 'NONE',
      phone: primaryPhone,
      employer: 'NONE',
      altPhone: secondaryPhone,
      verifiedSince:
        manager.managerStatus === 'active' && manager.verifiedAt
          ? formatDate(manager.verifiedAt.toJSDate())
          : '---',
      currentDorm: accommodation?.accommodationName ?? 'No assigned dorm yet',
      dormMeta: accommodation?.accommodationType ?? 'NONE',
    })
  }
}