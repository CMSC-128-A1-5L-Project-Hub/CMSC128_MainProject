import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Student from '#models/student'
import Landlord from '#models/landlord'

export default class AdminVerificationController {
  async index({ response }: HttpContext) {
   const users = await User.query().where('is_verified', false)

    const pendingUsers = []

    for (const user of users) {
      if (user.isVerified) {
        continue
      }

      const student = await Student.findBy('userId', user.userId)
      const landlord = await Landlord.findBy('userId', user.userId)

      if (!student && !landlord) {
        continue
      }

      pendingUsers.push({
        user,
        submittedRole: student ? 'student' : 'landlord',
        profile: student ?? landlord,
      })
    }

    return response.ok({
      message: 'Pending verification users fetched successfully',
      data: pendingUsers,
    })
  }

  async verify({ params, response }: HttpContext) {
    const user = await User.find(params.userId)

    if (!user) {
      return response.notFound({
        message: 'User not found',
      })
    }

    if (user.isVerified) {
      return response.badRequest({
        message: 'User is already verified',
      })
    }

    const student = await Student.findBy('userId', user.userId)
    const landlord = await Landlord.findBy('userId', user.userId)

    if (!student && !landlord) {
      return response.badRequest({
        message: 'No submitted student or landlord profile found for this user',
      })
    }

    if (student && landlord) {
      return response.badRequest({
        message: 'User has both student and landlord records. Verification is ambiguous',
      })
    }

    if (student) {
      user.isVerified = true
      user.role = 'student'
      await user.save()

      return response.ok({
        message: 'Student profile verified successfully',
        user,
      })
    }

    if (landlord) {
      user.isVerified = true
      user.role = 'landlord'
      await user.save()

      return response.ok({
        message: 'Landlord profile verified successfully',
        user,
      })
    }
  }
}