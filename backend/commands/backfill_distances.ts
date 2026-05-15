import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Accommodation from '#models/accommodation'
import DistanceService from '#services/distance'

export default class BackfillDistances extends BaseCommand {
  static commandName = 'accommodations:backfill-distances'
  static description = 'Compute walking/biking/driving distances for accommodations missing them'

  static options: CommandOptions = { startApp: true }

  async run() {
    const rows = await Accommodation.query()
      .whereNotNull('latitude')
      .whereNotNull('longitude')
      .where((q) =>
        q.whereNull('walkingDistance')
          .orWhereNull('bikingDistance')
          .orWhereNull('drivingDistance')
      )

    if (!rows.length) {
      this.logger.info('No accommodations need backfilling.')
      return
    }

    this.logger.info(`Backfilling ${rows.length} accommodation(s)...`)

    for (const acc of rows) {
      try {
        const { walkingMinutes, drivingMinutes, cyclingMinutes } =
          await DistanceService.calculate(Number(acc.latitude), Number(acc.longitude))
        acc.walkingDistance = acc.walkingDistance ?? walkingMinutes
        acc.drivingDistance = acc.drivingDistance ?? drivingMinutes
        acc.bikingDistance = acc.bikingDistance ?? cyclingMinutes
        await acc.save()
        this.logger.success(`#${acc.id} "${acc.accommodationName}" → w:${walkingMinutes} d:${drivingMinutes} b:${cyclingMinutes}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        this.logger.error(`#${acc.id}: ${msg}`)
      }
    }
  }
}
