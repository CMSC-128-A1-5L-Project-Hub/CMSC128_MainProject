import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Accommodation from '#models/accommodation'

export default class AccommodationTag extends BaseModel {
  static table = 'accommodation_tags'

  @column({ isPrimary: true })
  declare tagsId: number

  @column()
  declare accommodationId: number

  @column()
  declare tagDetail: string

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Accommodation, { foreignKey: 'accommodationId' })
  declare accommodation: BelongsTo<typeof Accommodation>
}