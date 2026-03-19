import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Landlord from '#models/landlord'
import Manager from '#models/manager'
import FileMetadata from '#models/file_metadata'
import AccommodationImage from '#models/accommodation_image'
import AccommodationTag from '#models/accommodation_tag'
import Room from '#models/room'
import Review from '#models/review'
import Bookmark from '#models/bookmark'
import Application from '#models/application'

export default class Accommodation extends BaseModel {
  static table = 'accommodation'

  @column({ isPrimary: true })
  declare accommodationId: number

  @column()
  declare landlordId: number

  @column()
  declare managerId: number

  @column()
  declare businessPermitId: number

  @column()
  declare accommodationName: string

  @column()
  declare accommodationLocation: string

  @column()
  declare accommodationType: 'on-campus' | 'off-campus' | 'partner_housing'

  @column()
  declare accommodationCapacity: number

  @column()
  declare tenantRestriction: 'male-only' | 'female-only' | 'coed'

  @column.date()
  declare applicationStartDate: DateTime

  @column.date()
  declare applicationEndDate: DateTime

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Landlord, { foreignKey: 'landlordId' })
  declare landlord: BelongsTo<typeof Landlord>

  @belongsTo(() => Manager, { foreignKey: 'managerId' })
  declare manager: BelongsTo<typeof Manager>

  @belongsTo(() => FileMetadata, { foreignKey: 'businessPermitId', localKey: 'fileId' })
  declare businessPermit: BelongsTo<typeof FileMetadata>

  @hasMany(() => AccommodationImage, { foreignKey: 'accommodationId' })
  declare images: HasMany<typeof AccommodationImage>

  @hasMany(() => AccommodationTag, { foreignKey: 'accommodationId' })
  declare tags: HasMany<typeof AccommodationTag>

  @hasMany(() => Room, { foreignKey: 'accommodationId' })
  declare rooms: HasMany<typeof Room>

  @hasMany(() => Review, { foreignKey: 'accommodationId' })
  declare reviews: HasMany<typeof Review>

  @hasMany(() => Bookmark, { foreignKey: 'accommodationId' })
  declare bookmarks: HasMany<typeof Bookmark>

  @hasMany(() => Application, { foreignKey: 'accommodationId' })
  declare applications: HasMany<typeof Application>
}
