import type { HttpContext } from '@adonisjs/core/http'
import Landlord from '#models/landlord'
import Accommodation from '#models/accommodation'
import User from '#models/user'
import PhoneNumber from '#models/phone_number'

export default class LandlordProfileController {
    async show({ auth, response }: HttpContext) {
    const authUser = auth.user!
    

    const user = await User.query()
        .where('id', authUser.id)
        .preload('phoneNumbers')
        .firstOrFail()

    const landlord = await Landlord.query()
        .where('userId', user.id)
        .firstOrFail()

    const accommodation = await Accommodation.query()
        .where('landlordId', user.id)
        .first()

    const primaryPhone = user.phoneNumbers.find((p) => p.isPrimary)?.contactNumber ?? 'NONE'
    const secondaryPhone = user.phoneNumbers.find((p) => !p.isPrimary)?.contactNumber ?? 'NONE'

    return response.ok({
        fullName: `${user.fname ?? ''} ${user.lname ?? ''}`.trim(),
        email: user.email ?? 'NONE',
        facebook: user.facebookAccount ?? 'NONE',
        phone: primaryPhone,
        altPhone: secondaryPhone,
        accommodation: accommodation?.accommodationName ?? 'No accommodation yet',
        accommodationType: accommodation?.accommodationType ?? '',
    })
    }

    async update({ auth, request, response }: HttpContext) {
    const authUser = auth.user!

    const user = await User.query()
        .where('id', authUser.id)
        .preload('phoneNumbers')
        .firstOrFail()

    const { facebook, phone, altPhone } = request.only(['facebook', 'phone', 'altPhone'])

    user.facebookAccount = facebook
    await user.save()

    const primaryPhone = user.phoneNumbers.find((p) => p.isPrimary)
    const secondaryPhone = user.phoneNumbers.find((p) => !p.isPrimary)

    if (primaryPhone) {
        primaryPhone.contactNumber = phone
        await primaryPhone.save()
    } else if (phone) {
        await PhoneNumber.create({ userId: user.id, contactNumber: phone, isPrimary: true })
    }

    if (secondaryPhone) {
        if (altPhone) {
            secondaryPhone.contactNumber = altPhone
            await secondaryPhone.save()
        } else {
            await secondaryPhone.delete()  // user cleared it, remove the row
        }
    } else if (altPhone) {
        await PhoneNumber.create({ userId: user.id, contactNumber: altPhone, isPrimary: false })
    }

    return response.ok({ message: 'Profile updated successfully' })
    }
}
