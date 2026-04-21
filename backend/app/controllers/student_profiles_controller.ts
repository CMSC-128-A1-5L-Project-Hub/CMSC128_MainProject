// import type { HttpContext } from '@adonisjs/core/http'


import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'


export default class StudentProfileController {
  async show({ auth, response }: HttpContext) {
    const user = auth.user


    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }


    const student = await Student.query()
      .where('userId', user.id)
      .first()


    if (!student) {
      return response.notFound({ message: 'Student profile not found' })
    }


    return response.ok({
      fullName: `${user.fname} ${user.lname}`,
      shortName: user.fname ?? 'Student',
      course: student.degreeProgram ?? '',
      campus: 'UPLB',
      email: user.email ?? '',
      phone: '',
      studentNo: student.studentNumber ?? '',
      college: student.college ?? '',
      yearLevel: student.yearLevel ?? '',
      status: user.accountStatus ?? '',
    })
  }
}