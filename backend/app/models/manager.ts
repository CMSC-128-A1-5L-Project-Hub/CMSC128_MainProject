import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Accommodation from '#models/accommodation'

export default class Manager extends BaseModel {
  static table = 'manager'

  @column({ isPrimary: true })
  declare userId: number

  @column()
  declare managerStatus: 'active' | 'inactive'

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Accommodation, { foreignKey: 'managerId' })
  declare accommodations: HasMany<typeof Accommodation>
}
