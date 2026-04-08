import Log from '#models/log'
import { DateTime } from 'luxon'

export default class LogService {
  
  // ─── 1. CORE RECORDING METHOD ───
  async record(
    actorId: number | null,
    entityType:
      | 'application'
      | 'assignment'
      | 'payment'
      | 'room'
      | 'accommodation'
      | 'document'
      | 'report'
      | 'fee'
      | 'account', // for auth logs
    entityId: number,
    activityType: string,
    activityDetails: string | null = null
  ) {
    await Log.create({
      actorId,
      entityType,
      entityId,
      activityType,
      activityDetails,
    })
  }

  // ─── 2. SPECIFIC ACTION LOGGERS ───
  async recordApplication(actorId: number, actorRole: string, accommodationId: number) {
    const timestamp = DateTime.now().toFormat('yyyy-MM-dd')
    const roleLabel = actorRole.charAt(0).toUpperCase() + actorRole.slice(1)
    const activityDetails = `${timestamp} - ${roleLabel} ${actorId} applied for Accommodation ${accommodationId}`

    await this.record(
      actorId,
      'application',
      accommodationId,
      'application_submitted',
      activityDetails
    )
  }

  async logAuthActivity(user: any, activityType: 'logged_in' | 'logged_out') {
    try {
      const timestamp = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
      
      // Fallback to ID if username isn't available from Google SSO
      const identifier = user.fname ? `${user.fname} ${user.lname}` : `User ${user.id}`
      
      const activityDetails = `${identifier} ${
        activityType === 'logged_in' ? 'logged into' : 'logged out of'
      } the website at ${timestamp}`

      await this.record(
        user.id,
        'account',
        user.id, // The entity being affected is the user's own account
        activityType,
        activityDetails
      )
    } catch (error) {
      console.error('Failed to log auth activity:', error)
    }
  }

  // ─── 3. FETCHING LOGS (For the Super Admin Dashboard) ───
  async getFilteredLogs(filters: any = {}) {
    const query = Log.query().preload('actor').orderBy('logTimestamp', 'desc')

    if (filters.id) {
      query.where('id', filters.id)
    }
    if (filters.entity_type) {
      query.where('entityType', filters.entity_type)
    }
    if (filters.actor_id) {
      query.where('actorId', filters.actor_id)
    }

    return await query
  }
}