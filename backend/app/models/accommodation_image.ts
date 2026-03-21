import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Accommodation from '#models/accommodation'
import FileMetadata from '#models/file_metadata'

export default class AccommodationImage extends BaseModel {
  static table = 'accommodation_images'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare accommodationId: number

  @column()
  declare imageFileId: number

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Accommodation, { foreignKey: 'accommodationId' })
  declare accommodation: BelongsTo<typeof Accommodation>

  @belongsTo(() => FileMetadata, { foreignKey: 'imageFileId' })
  declare file: BelongsTo<typeof FileMetadata>
}
