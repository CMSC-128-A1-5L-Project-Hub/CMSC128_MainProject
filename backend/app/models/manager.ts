import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Accommodation from '#models/accommodation'
import { DateTime } from 'luxon'

export default class Manager extends BaseModel {
  static table = 'managers'

  @column({ isPrimary: true })
  declare userId: number

  @column()
  declare managerStatus: 'active' | 'inactive'

  @column.dateTime({ columnName: 'verified_at' })
  declare verifiedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Accommodation, { foreignKey: 'managerId' })
  declare accommodations: HasMany<typeof Accommodation>
}