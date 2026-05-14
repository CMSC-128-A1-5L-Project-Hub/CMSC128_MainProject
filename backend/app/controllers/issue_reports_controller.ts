import type { HttpContext } from '@adonisjs/core/http'
import IssueReport from '#models/issue_report'

export default class IssueReportsController {
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const data = request.only([
      'reportableType',
      'reportableId',
      'reason',
      'additionalDetails',
    ])

    const report = await IssueReport.create({
      reporterId: user.id,
      reportableType: data.reportableType,
      reportableId: data.reportableId,
      reason: data.reason,
      additionalDetails: data.additionalDetails,
      status: 'pending',
    })

    return response.created(report)
  }
}