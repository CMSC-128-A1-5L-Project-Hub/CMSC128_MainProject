import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Application from '#models/application'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import WaitlistWorkflowService from '#services/waitlisted_workflow_service'
import LogService from '#services/log_service'

export default class ExpireApplications extends BaseCommand {
  static commandName = 'applications:expire'
  static description = 'Auto-cancel approved applications that missed their confirmation deadline'

  // tells Adonis to boot the database and services before running
  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Scanning for expired application deadlines...')

    // use standard SQL date format
    const nowStr = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
    this.logger.info(`Current DB Time Comparison: ${nowStr}`)

    // build the query
    const query = Application.query()
      .where('application_status', 'approved')
      .whereNull('slot_confirmed_at')
      .whereNotNull('slot_confirm_deadline')
      .where('slot_confirm_deadline', '<', nowStr)

    // debig, print the raw SQL query to the terminal
    this.logger.info(`Raw Query: ${query.toQuery()}`)

    const expiredApps = await query

    if (expiredApps.length === 0) {
      this.logger.info('No expired applications found.')
      return
    }

    // instantiate Waitlist Service to properly re-queue the room
    const waitlistService = await app.container.make(WaitlistWorkflowService)

    // loop through and cancel each one
    for (const application of expiredApps) {
      try {
        this.logger.info(`Processing expiration for Application #${application.id}...`)

        // run waitlist service, acts exactly like the student clicking "Decline"
        await waitlistService.processWaitlistCancellation(application.id)
        
        // ensure the status is set to cancelled
        application.applicationStatus = 'cancelled'
        await application.save()

        // log the system action 
        await LogService.record(1, 'application', application.id, 'SYSTEM_AUTO_CANCELLED')

        this.logger.success(`Successfully auto-cancelled Application #${application.id}`)
      } catch (error) {
        // safely extract error message for TypeScript
        const errorMessage = error instanceof Error ? error.message : String(error)
        this.logger.error(`Failed to cancel Application #${application.id}: ${errorMessage}`) 
      }
    }
  }
}