import cron from 'node-cron'
import { checkApplicationDeadline } from '#helpers/deadline_helper'
import Application from '#models/application'

export default class SchedulerService {
  static start() {
    // Runs every day at 00:00 (midnight)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running midnight job:', new Date().toISOString())

        const apps = await Application.query().where('applicationStatus', 'pending')

        for (const application of apps) {
            await checkApplicationDeadline(application)
        }
        
    })
  }
}