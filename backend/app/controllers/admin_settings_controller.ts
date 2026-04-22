import type { HttpContext } from '@adonisjs/core/http'
import SysVariables from '#models/sys_variable'
import Student from '#models/student'
import User from '#models/user'

// This can be refactored to use a service class if we want to separate the business logic from the controller
export default class AdminSettingsController {
  async index({ response }: HttpContext) {
    const settings = await SysVariables.query()
      .orderBy('semStartDate', 'desc')
      .first()

    const semesterMap: Record<string, string> = {
      first_sem: '1st Semester',
      second_sem: '2nd Semester',
      midyear: 'Midyear',
    }

    if (!settings) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'System settings not found.',
      })
    }

    return response.ok({
      status: 200,
      data: {
        id: settings.id,
        currentSemester: semesterMap[settings.currentSemester] ?? settings.currentSemester,
        currentSy: settings.currentSy,
        semStartDate: settings.semStartDate,
        uplbLatitude: settings.uplbLatitude,
        uplbLongitude: settings.uplbLongitude,
      },
    })
  }

  async update({ request, response, serialize }: HttpContext) {
    const settings = await SysVariables.query()
      .orderBy('semStartDate', 'desc')
      .first()

    if (!settings) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'System settings not found.',
      })
    }

    const { currentSemester, currentSy } = request.body()

    settings.merge({
      ...(currentSemester && { currentSemester }),
      ...(currentSy && { currentSy }),
    })

    await Student.query().update({
      form5_renewal: true,
    })

    await settings.save()

    return serialize(settings.serialize())
  }

  async countUsers({ response }: HttpContext) {
  const totalUsers = await User.query().count('* as total')

  return response.ok({
    status: 200,
    data: {
      total: Number(totalUsers[0].$extras.total),
    },
  })
}
}

