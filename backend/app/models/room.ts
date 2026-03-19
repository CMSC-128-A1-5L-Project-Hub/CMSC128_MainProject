import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Accommodation from '#models/accommodation'
import Transient from '#models/transient'
import NonTransient from '#models/non_transient'

export default class Room extends BaseModel {
  static table = 'room'

  @column({ isPrimary: true })
  declare roomId: number

  @column()
  declare accommodationId: number

  @column()
  declare roomNumber: string

  @column()
  declare roomType: 'single' | 'double' | 'shared'

  @column()
  declare roomCapacity: number

  @column()
  declare roomCurrentOccupancy: number

  @column()
  declare roomBuilding: string

  @column()
  declare roomRent: number

  @column()
  declare tenantRestriction: 'coed' | 'non-coed'

  @column()
  declare roomAvailability: 'available' | 'occupied' | 'maintenance'

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Accommodation, { foreignKey: 'accommodationId' })
  declare accommodation: BelongsTo<typeof Accommodation>

  @hasOne(() => Transient, { foreignKey: 'roomId' })
  declare transient: HasOne<typeof Transient>

  @hasOne(() => NonTransient, { foreignKey: 'roomId' })
  declare nonTransient: HasOne<typeof NonTransient>
}
