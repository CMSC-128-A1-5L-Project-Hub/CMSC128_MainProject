import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class PhoneNumber extends BaseModel {
  static table = 'phone_number'

  @column({ isPrimary: true })
  declare phoneNumberId: number

  @column()
  declare userId: number

  @column()
  declare contactNumber: string

  // Stored as ENUM('true','false') in DB — cast to boolean for convenience
  @column({
    prepare: (val: boolean) => (val ? 'true' : 'false'),
    consume: (val: string) => val === 'true',
  })
  declare isPrimary: boolean

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
