import type { HttpContext } from '@adonisjs/core/http'
import SysVariables from '#models/sys_variable'
import Student from '#models/student'

export default class AdminSettingsController {
    async index({ request, response }: HttpContext) {
        const {
            id
        } = request.qs()

        const admin = await SysVariables.query().where('id', id).first();

        if (!admin) {
            return response.notFound({
                status: 404,
                error: 'Not Found',
                message: 'System variable not found or does not belong to you.',
            })
        }

        return response.ok({
            status: 200,
            data: {
                id: admin.id,
                currentSemester: admin.currentSemester,
                currentSy: admin.currentSy,
                semStartDate: admin.semStartDate,
                uplbLatitude: admin.uplbLatitude,
                uplbLongitude: admin.uplbLongitude,
            }
        })
    }


    async update({ request, auth, response, serialize }: HttpContext) {
        const admin = auth.user!.id

        const sys_variables = await SysVariables.query()
            .where('id', admin)
            .first()

        if (!sys_variables) {
            return response.notFound({
                status: 404,
                error: 'Not Found',
                message: 'System variable not found or does not belong to you.',
            })
        }

        const {
            currentSemester,
            currentSy
        } = request.body()


        sys_variables.merge({
            ...(currentSemester && { currentSemester: currentSemester }),
            ...(currentSy && { currentSy: currentSy }),
        })

        await Student
            .query()
            .update({
                form5_renewal: true
            })

        await sys_variables.save()

        return serialize(sys_variables.serialize())
    }
}