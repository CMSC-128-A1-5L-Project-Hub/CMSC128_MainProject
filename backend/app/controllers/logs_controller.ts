import type { HttpContext } from '@adonisjs/core/http'
import Log from '#models/log'

export default class LogsController {
  /**
   * GET /logs
   * Super admin: retrieve all audit logs with optional filters.
   * Query parameters are optional for specific retrieve of log data.
   * Leaving it null, will get all the data in descending order based on timestamp.
   */
  async index({ request, serialize }: HttpContext) {
    const { id, entity_type, actor_id } = request.qs()

    const query = Log.query().preload('actor').orderBy('logTimestamp', 'desc')

    if (id) {
      query.where('id', id)
    }

    if (entity_type) {
      query.where('entityType', entity_type)
    }

    if (actor_id) {
      query.where('actorId', actor_id)
    }

    const logs = await query

    return serialize(logs)
  }
}
