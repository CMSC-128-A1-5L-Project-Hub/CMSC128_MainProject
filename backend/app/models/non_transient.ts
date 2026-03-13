import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Room from '#models/room'

export default class NonTransient extends BaseModel {
  static table = 'non_transient'

  @column({ isPrimary: true })
  declare nonTransientId: number

  @column()
  declare roomId: number

  // ─── Non-transient-specific attributes ───────────────────────────────────
  // Duration of stay offered (e.g. '1 semester', '1 year')
  @column()
  declare durationOfStay: string

  // Monthly rent for this non-transient room
  @column()
  declare roomRentMonthly: number

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Room, { foreignKey: 'roomId' })
  declare room: BelongsTo<typeof Room>
}