// app/controllers/auth_controller.ts
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import ProvisioningService from '#services/provisioning_service'
import NotificationService from '#services/notification_service'
import LogService from '#services/log_service'
import User from '#models/user'
import { signFileUrl } from '#services/image_service'
import PhoneNumber from '#models/phone_number'
import Accommodation from '#models/accommodation'

@inject()
export default class AuthController {
  constructor(
    protected provisioningService: ProvisioningService,
    protected notificationService: NotificationService,
    protected logService: LogService
  ) { }

  async devLogin({ auth, request, response, session }: HttpContext) {
    // if (env.get('NODE_ENV') === 'production') {
    //   return response.status(403).send('Not allowed in production')
    // }

    const role = request.input('role', 'student')

    let user
    if (role === 'manager') {
      const accommodation = await Accommodation.query().whereNotNull('managerId').first()
      if (!accommodation) {
        return response.status(404).send('No accommodation with an assigned manager found. Please seed your DB.')
      }
      user = await User.query().where('id', accommodation.managerId!).first()
    } else if (role === 'student') {
      user = await User.query()
        .where('role', 'student')
        .whereHas('student', (q) => q)
        .first()
    } else {
      user = await User.query().where('role', role).first()
    }

    if (!user) {
      return response.status(404).send(`No user found with role: ${role}. Please seed your DB.`)
    }

    session.clear()
    session.regenerate()

    await auth.use('web').login(user)
    session.put('role', user.role)

    await LogService.logAuthActivity(user, 'logged_in')

    return response.ok({ id: user.id, role: user.role })
  }

  // STEP 1: Redirect user to Google login screen
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  // STEP 2: Handle response from Google
  async callback({ ally, auth, response, session }: HttpContext) {
    const google = ally.use('google')
    if (google.accessDenied()) return 'Access was denied'
    if (google.stateMisMatch()) return 'Request expired. Retry again'
    if (google.hasError()) return google.getError()

    const googleUser = await google.user()
    const user = await this.provisioningService.provision({
      email: googleUser.email,
      fname: googleUser.original.given_name,
      lname: googleUser.original.family_name,
    })

    await auth.use('web').login(user)

    // Set role in session so RoleMiddleware can read it
    session.put('role', user.role)

    await LogService.logAuthActivity(user, 'logged_in')

    return response.redirect(`${env.get('FRONTEND_URL')}/auth/success`)
  }

  // ─── POST /logout ─────────────────────────────────────────────────────────
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Logged out' })
  }

  // ─── GET /me ──────────────────────────────────────────────────────────────
  async me({ auth, response }: HttpContext) {
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('phoneNumbers')
      .preload('profilePicture')
      .firstOrFail()

    // Role-specific preloads
    if (user.role === 'student') {
      await user.load('student')
    } else if (user.role === 'manager') {
      await user.load('manager', (q) => q.preload('accommodations'))
    } else if (user.role === 'landlord') {
      await user.load('landlord')
    }

    const serialized = user.serialize()
    serialized.profilePictureUrl = await signFileUrl(user.profilePicture)

    // Attach dormitory name for managers
    if (user.role === 'manager' && user.manager && user.manager.accommodations.length > 0) {
      serialized.dormitory = user.manager.accommodations[0].accommodationName
    } else {
      serialized.dormitory = null
    }

    return response.ok(serialized)
  }

  // ─── PUT /me ──────────────────────────────────────────────────────────────
  async updateMe({ auth, request, response }: HttpContext) {
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('student')
      .preload('phoneNumbers')
      .preload('profilePicture')
      .firstOrFail()

    const data = request.only([
      'facebookAccount',
      'emergencyContactName',
      'emergencyContactNumber',
      'primaryPhone',
      'secondaryPhone',
    ])

    // Update facebook
    if (data.facebookAccount !== undefined) {
      user.facebookAccount = data.facebookAccount || null
      await user.save()
    }

    // Update emergency contacts (student only)
    const student = user.student
    if (student) {
      if (data.emergencyContactName !== undefined)
        student.emergencyContactName = data.emergencyContactName || null
      if (data.emergencyContactNumber !== undefined)
        student.emergencyContactNumber = data.emergencyContactNumber || null
      await student.save()
    }

    // Update primary phone
    if (data.primaryPhone !== undefined) {
      const primary = user.phoneNumbers.find((p) => p.isPrimary)
      if (primary) {
        primary.contactNumber = data.primaryPhone
        await primary.save()
      } else if (data.primaryPhone) {
        await PhoneNumber.create({ userId: user.id, contactNumber: data.primaryPhone, isPrimary: true })
      }
    }

    // Update secondary phone
    if (data.secondaryPhone !== undefined) {
      const secondary = user.phoneNumbers.find((p) => !p.isPrimary)
      if (secondary) {
        secondary.contactNumber = data.secondaryPhone
        await secondary.save()
      } else if (data.secondaryPhone) {
        await PhoneNumber.create({ userId: user.id, contactNumber: data.secondaryPhone, isPrimary: false })
      }
    }

    // Reload and return
    await user.load('student')
    await user.load('phoneNumbers')
    await user.load('profilePicture')

    const serialized = user.serialize()
    serialized.profilePictureUrl = await signFileUrl(user.profilePicture)
    return response.ok(serialized)
  }

  // ─── POST /me/profile-picture ────────────────────────────────────────────
  async uploadProfilePicture({ auth, request, response }: HttpContext) {
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('profilePicture')
      .firstOrFail()

    const file = request.file('profilePicture', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (!file) {
      return response.badRequest({ message: 'No file uploaded.' })
    }

    if (!file.isValid) {
      return response.badRequest({ message: file.errors[0]?.message ?? 'Invalid file.' })
    }

    const { uploadImage } = await import('#services/b2_services')
    const filePath = await uploadImage(file, 'profiles')

    const FileMetadata = (await import('#models/file_metadatum')).default

    const meta = await FileMetadata.create({
      fileName: file.clientName,
      filePath,
      fileType: 'image',
    })

    user.pfpFileId = meta.id
    await user.save()

    await user.load('profilePicture')
    const profilePictureUrl = await signFileUrl(user.profilePicture)

    return response.ok({ profilePictureUrl })
  }
}
