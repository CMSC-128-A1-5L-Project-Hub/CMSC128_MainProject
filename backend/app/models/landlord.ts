import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Accommodation from '#models/accommodation'

export default class Landlord extends BaseModel {
  static table = 'landlord'

  @column({ isPrimary: true })
  declare userId: number

  @column()
  declare tin: string

  @column()
  declare accommodationName: string

  @column()
  declare businessAddress: string

  @column()
  declare contactNumber: string

  @column()
  declare businessPermitId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Accommodation, { foreignKey: 'landlordId' })
  declare accommodations: HasMany<typeof Accommodation>
}