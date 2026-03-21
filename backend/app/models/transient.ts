import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Room from '#models/room'

export default class Transient extends BaseModel {
  static table = 'transient'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roomId: number

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Room, { foreignKey: 'roomId' })
  declare room: BelongsTo<typeof Room>
}
