import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Student from '#models/student'
import Landlord from '#models/landlord'
import NotificationService from '#services/notification_service'
import LogService from '#services/log_service'
import { signImageUrl } from '#services/image_service'

@inject()
export default class AdminVerificationsController {
  constructor(protected notificationService: NotificationService) {}

  // Gets all users waiting for Admin approval
  async index({ response }: HttpContext) {
    // 1. Find all users who are still 'unassigned'
    const users = await User.query()
      .where('role', 'unassigned')
      .where('account_status', 'pending')

    const pendingUsers = []

    for (const user of users) {
      // 2. Check if they submitted the setup form
      const student = await Student.query()
        .where('userId', user.id)
        .preload('enrollmentProof')
        .first()
      const landlord = await Landlord.findBy('userId', user.id)

      // 3. Only add them to the list if they actually submitted their details
      if (student || landlord) {
        const profileDetails: any = (student || landlord)?.toJSON()

        if (student?.enrollmentProof) {
          const proof = student.enrollmentProof
          profileDetails.enrollmentProof = {
            id: proof.id,
            fileName: proof.fileName,
            fileType: proof.fileType,
            url: await signImageUrl(proof.filePath),
          }
        }

        pendingUsers.push({
          user,
          requestedRole: student ? 'student' : 'landlord',
          profileDetails,
        })
      }
    }

    return response.ok(pendingUsers)
  }

  // Approves the user by changing their role
  async verify({ auth, request, params, response }: HttpContext) {
    const { roleToAssign } = request.all() // 'student' or 'landlord'

    // Note: the route says :userId, so we use params.userId here
    const user = await User.findOrFail(params.userId)

    user.role = roleToAssign
    user.accountStatus = 'active' // Automatically activate their account once verified
    await user.save()

    if (roleToAssign === 'student') {
      const student = await Student.findBy('userId', user.id)
      if (student) {
        student.form5Renewal = true
        await student.save()
      }
    }

    await this.notificationService.sendAccountApprovedEmail(user, roleToAssign)

    try {
      await LogService.record(
        auth.user?.id ?? null,
        'account',
        user.id,
        'ACCOUNT_VERIFIED',
        `Admin ${auth.user?.id ?? 'system'} verified ${roleToAssign} account for ${user.fname} ${user.lname} (user ${user.id})`
      )
    } catch (e) {
      console.error('Failed to log ACCOUNT_VERIFIED:', e)
    }

    return response.ok(user)
  }

  async reject({ auth, request, params, response }: HttpContext) {
    const user = await User.findOrFail(params.userId)
    const { reason } = request.all()

    user.role = 'unassigned'
    user.accountStatus = 'rejected'
    // user.submittedAt = null

    await user.save()

    try {
      await LogService.record(
        auth.user?.id ?? null,
        'account',
        user.id,
        'ACCOUNT_REJECTED',
        `Admin ${auth.user?.id ?? 'system'} rejected account for ${user.fname} ${user.lname} (user ${user.id})${reason ? `: ${reason}` : ''}`
      )
    } catch (e) {
      console.error('Failed to log ACCOUNT_REJECTED:', e)
    }

    return response.ok({
      message: 'User verification rejected',
      user,
    })
  }
}
