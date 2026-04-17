import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Landlord from '#models/landlord'
import Manager from '#models/manager'
import FileMetadata from '#models/file_metadatum'
import AccommodationImage from '#models/accommodation_image'
import AccommodationTag from '#models/accommodation_tag'
import Room from '#models/room'
import Review from '#models/review'
import Bookmark from '#models/bookmark'
import Application from '#models/application'

export default class Accommodation extends BaseModel {
  static table = 'accommodations'

  @column({ isPrimary: true })
  declare id: number

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
  declare status: string

  @column()
  declare longitude: number | null

  @column()
  declare latitude: number | null

  @column()
  declare walkingDistance: number | null

  @column()
  declare bikingDistance: number | null

  @column()
  declare drivingDistance: number | null

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
   
  // ─── Freeze columns (for manager handover) ────────────────────────────────
  @column()
  declare isFrozen: boolean
 
  @column()
  declare freezeReason: string | null
 
  @column.dateTime()
  declare freezeStartedAt: DateTime | null

  @belongsTo(() => Landlord, { foreignKey: 'userId' })
  declare landlord: BelongsTo<typeof Landlord>

  @belongsTo(() => Manager, { foreignKey: 'userId' })
  declare manager: BelongsTo<typeof Manager>

  @belongsTo(() => FileMetadata, { foreignKey: 'businessPermitId' })
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