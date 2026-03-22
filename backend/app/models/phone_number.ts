import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class PhoneNumber extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare contactNumber: string

  @column()
  declare isPrimary: boolean

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}