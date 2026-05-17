import type { HttpContext } from '@adonisjs/core/http'
import ReportService from '#services/report_service'
import ReportExportService from '#services/report_export_service'

// This controller should already be fine @windee, pa-edit nalang ng report_service.ts
export default class ReportsController {

  // ─── MANAGER: VIEW OCCUPANCY STATS ───
  // GET /reports/occupancy
  async occupancy({ auth, response }: HttpContext) {
    const data = await ReportService.getOccupancyStats(auth.user!)
    return response.ok(data)
  }

  // ─── MANAGER: VIEW APPLICATION TRENDS ───
  // GET /reports/applications
  async applicationTrends({ auth, response }: HttpContext) {
    const data = await ReportService.getApplicationTrends(auth.user!)
    return response.ok(data)
  }

  // ─── LANDLORD: VIEW REVENUE PROJECTIONS ───
  // GET /reports/revenue
  async revenue({ auth, request, response }: HttpContext) {
    const accommodationId = request.input('accommodationId')
    const data = await ReportService.getRevenueProjections(
      auth.user!,
      accommodationId ? Number(accommodationId) : undefined
    )
    return response.ok(data)
  }

  // ─── LANDLORD: VIEW UNPAID STUDENTS ───
  // GET /reports/delinquency
  async delinquency({ auth, request, response }: HttpContext) {
    const accommodationId = request.input('accommodationId')
    const data = await ReportService.getDelinquentStudents(
      auth.user!,
      accommodationId ? Number(accommodationId) : undefined
    )
    return response.ok(data)
  }

  // ─── LANDLORD: DOWNLOAD OCCUPANCY REPORT (PDF) ───
  // GET /reports/occupancy/pdf
  async occupancyPdf({ auth, response }: HttpContext) {
    const buf = await ReportExportService.generateOccupancyPdf(auth.user!)
    return this.sendPdf(response, buf, 'occupancy')
  }

  // ─── LANDLORD: DOWNLOAD OVERDUE FEES (XLSX) ───
  // GET /reports/overdue-fees/xlsx
  async overdueFeesXlsx({ auth, response }: HttpContext) {
    const buf = await ReportExportService.generateOverdueFeesXlsx(auth.user!)
    return this.sendXlsx(response, buf, 'overdue-fees')
  }

  // ─── LANDLORD: DOWNLOAD REVENUE SUMMARY (PDF) ───
  // GET /reports/revenue/pdf
  async revenuePdf({ auth, response }: HttpContext) {
    const buf = await ReportExportService.generateRevenuePdf(auth.user!)
    return this.sendPdf(response, buf, 'revenue-summary')
  }

  // ─── LANDLORD: DOWNLOAD ACCOMMODATION HISTORY (PDF) ───
  // GET /reports/accommodation-history/pdf
  async accommodationHistoryPdf({ auth, response }: HttpContext) {
    const buf = await ReportExportService.generateAccommodationHistoryPdf(auth.user!)
    return this.sendPdf(response, buf, 'accommodation-history')
  }

  // ─── LANDLORD: DOWNLOAD WAITING LIST (XLSX) ───
  // GET /reports/waiting-list/xlsx
  async waitingListXlsx({ auth, response }: HttpContext) {
    const buf = await ReportExportService.generateWaitingListXlsx(auth.user!)
    return this.sendXlsx(response, buf, 'waiting-list')
  }

  // ─── LANDLORD: DOWNLOAD HOUSED STUDENTS (XLSX) ───
  // GET /reports/housed-students/xlsx
  async housedStudentsXlsx({ auth, response }: HttpContext) {
    const buf = await ReportExportService.generateHousedStudentsXlsx(auth.user!)
    return this.sendXlsx(response, buf, 'housed-students')
  }

  private sendPdf(response: HttpContext['response'], buf: Buffer, prefix: string) {
    const date = new Date().toISOString().slice(0, 10)
    response.header('Content-Type', 'application/pdf')
    response.header(
      'Content-Disposition',
      `attachment; filename="${prefix}-${date}.pdf"`
    )
    return response.send(buf)
  }

  private sendXlsx(response: HttpContext['response'], buf: Buffer, prefix: string) {
    const date = new Date().toISOString().slice(0, 10)
    response.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response.header(
      'Content-Disposition',
      `attachment; filename="${prefix}-${date}.xlsx"`
    )
    return response.send(buf)
  }
}
