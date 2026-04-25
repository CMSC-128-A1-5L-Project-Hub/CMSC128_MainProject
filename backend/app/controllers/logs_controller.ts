// app/controllers/logs_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import LogService from '#services/log_service'
import Log from '#models/log'
import Accommodation from '#models/accommodation'
import Room from '#models/room'
import Application from '#models/application'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class LogsController {

  async index({ request, serialize }: HttpContext) {
    const filters = request.qs()
    const logs = await LogService.getFilteredLogs(filters)
    return serialize(logs)
  }

  // ─── MANAGER: RECENT ACTIVITY FOR DASHBOARD ───
  async managerLogs({ auth, serialize }: HttpContext) {
    const user = auth.user!

    // 1. Accommodations managed by the user
    const accommodations = await Accommodation.query().where('managerId', user.id)
    const accIds = accommodations.map(a => a.id)
    if (accIds.length === 0) return serialize([])

    // 2. Rooms in those accommodations
    const rooms = await Room.query().whereIn('accommodationId', accIds)
    const roomIds = rooms.map(r => r.id)

    // 3. Applications for those accommodations
    const applications = await Application.query().whereIn('accommodationId', accIds)
    const appIds = applications.map(a => a.id)

    // 4. Assignments for those rooms
    const assignments = await db.from('assignments').whereIn('room_id', roomIds).select('id')
    const assignmentIds = assignments.map(a => a.id)

    // Combine all relevant entity IDs
    const entityIds = {
      accommodation: accIds,
      room: roomIds,
      application: appIds,
      assignment: assignmentIds,
    }

    // 5. Fetch logs for all these entities
    const logs = await Log.query()
      .where((query) => {
        for (const [type, ids] of Object.entries(entityIds)) {
          if (ids.length > 0) {
            query.orWhere((q) => {
              q.where('entityType', type as any).whereIn('entityId', ids)
            })
          }
        }
      })
      .preload('actor')
      .orderBy('logTimestamp', 'desc')
      .limit(10)

    return serialize(logs)
  }
}