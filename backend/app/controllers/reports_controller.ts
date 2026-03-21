import type { HttpContext } from '@adonisjs/core/http'
import ReportService from '#services/report_service'

// This controller should already be fine @windee, pa-edit nalang ng report_service.ts
export default class ReportsController {
  
  // ─── MANAGER: VIEW OCCUPANCY STATS ───
  // GET /reports/occupancy
  async occupancy({ auth, serialize }: HttpContext) {
    const data = await ReportService.getOccupancyStats(auth.user!)
    return serialize(data)
  }

  // ─── MANAGER: VIEW APPLICATION TRENDS ───
  // GET /reports/applications
  async applicationTrends({ auth, serialize }: HttpContext) {
    const data = await ReportService.getApplicationTrends(auth.user!)
    return serialize(data)
  }

  // ─── LANDLORD: VIEW REVENUE PROJECTIONS ───
  // GET /reports/revenue
  async revenue({ auth, serialize }: HttpContext) {
    const data = await ReportService.getRevenueProjections(auth.user!)
    return serialize(data)
  }

  // ─── LANDLORD: VIEW UNPAID STUDENTS ───
  // GET /reports/delinquency
  async delinquency({ auth, serialize }: HttpContext) {
    const data = await ReportService.getDelinquentStudents(auth.user!)
    return serialize(data)
  }
}