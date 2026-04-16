import type { ApplicationService } from '@adonisjs/core/types'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  async ready() {
    // Only run scheduler when http is active
    if (this.app.getEnvironment() === 'web') {
      const { default: SchedulerService } = await import('#services/scheduler_service')
      SchedulerService.start()
    }
  }
}