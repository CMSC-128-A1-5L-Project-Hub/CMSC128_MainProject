import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProvisioningService from '#services/provisioning_service'
import NotificationService from '#services/notification_service'
import LogService from '#services/log_service'
import User from '#models/user'
import { signFileUrl } from '#services/image_service'

@inject()
export default class AuthController {
  constructor(
    protected provisioningService: ProvisioningService,
    protected notificationService: NotificationService,
    protected logService: LogService
  ) {}

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

  switch (user.role) {
    case 'landlord':
      return response.redirect('http://localhost:5173/landlord/dashboard')
    case 'student':
      return response.redirect('http://localhost:5173/student/dashboard')
    case 'manager':
      return response.redirect('http://localhost:5173/manager/dashboard')
    case 'super_admin':
      return response.redirect('http://localhost:5173/admin/dashboard')
    default:
      return response.redirect('http://localhost:5173/auth/role')
  }
}

  // ─── GET /me ──────────────────────────────────────────────────────────────
  async me({ auth, serialize }: HttpContext) {
    const userId = auth.user!.id
    const role = auth.user!.role

    const query = User.query()
      .where('id', userId)
      .preload('student')
      .preload('phoneNumbers')
      .preload('profilePicture')

    // Conditionally preload Manager and Accommodations if the role matches
    if (role === 'manager') {
      query.preload('manager', (managerQuery) => {
        managerQuery.preload('accommodations')
      })
    }

    const user = await query.firstOrFail()

    const serialized = user.serialize()

    // Add the signed URL for the profile picture
    if (user.profilePicture) {
      serialized.profilePictureUrl = await signFileUrl(user.profilePicture)
    }

    return serialize(serialized)
  }

  // ─── PUT /me ──────────────────────────────────────────────────────────────
  async updateMe({ auth, request, serialize }: HttpContext) {
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('student')
      .preload('phoneNumbers')
      .preload('profilePicture')
      .firstOrFail()

    const data = request.only([
      'facebookAccount',
      'college',
      'degreeProgram',
      'gender',
      'emergencyContactName',
      'emergencyContactNumber',
    ])

    // Update user-level field
    if (data.facebookAccount !== undefined) {
      user.facebookAccount = data.facebookAccount || null
      await user.save()
    }

    // Update student-level fields (only if user is a student)
    const student = user.student
    if (student) {
      if (data.college !== undefined) student.college = data.college
      if (data.degreeProgram !== undefined) student.degreeProgram = data.degreeProgram
      if (data.gender !== undefined) student.gender = data.gender
      if (data.emergencyContactName !== undefined)
        student.emergencyContactName = data.emergencyContactName || null
      if (data.emergencyContactNumber !== undefined)
        student.emergencyContactNumber = data.emergencyContactNumber || null
      await student.save()
    }

    // Reload and return updated profile
    await user.load('student')
    await user.load('phoneNumbers')
    await user.load('profilePicture')

    const serialized = user.serialize()
    serialized.profilePictureUrl = await signFileUrl(user.profilePicture)

    return serialize(serialized)
  }
}