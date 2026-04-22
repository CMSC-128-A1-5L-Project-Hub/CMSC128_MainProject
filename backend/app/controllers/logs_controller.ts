import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import LogService from '#services/log_service'

@inject()
export default class LogsController {
  
  constructor(protected logService: LogService) {}

  /**
   * GET /logs
   * Super admin: retrieve all audit logs with optional filters.
   */
  async index({ request, serialize }: HttpContext) {
    // 1. Grab any filters from the URL (e.g. ?actor_id=5)
    const filters = request.qs()

    // 2. Get data from service
    const logs = await this.logService.getFilteredLogs(filters)

    // 3. Serve it to the frontend
    return serialize(logs)
  }
}