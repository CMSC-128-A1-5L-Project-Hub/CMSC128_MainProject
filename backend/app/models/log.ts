import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Log extends BaseModel {
  static table = 'logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare actorId: number | null

  @column()
  declare entityType: 'application' | 'assignment' | 'payment' | 'room' | 'accommodation' | 'document' | 'report' | 'fee'

  @column()
  declare entityId: number

  @column.dateTime({ autoCreate: true })
  declare logTimestamp: DateTime

  @column()
  declare activityType: string

  @column()
  declare activityDetails: string | null

  @belongsTo(() => User, { foreignKey: 'actorId' })
  declare actor: BelongsTo<typeof User>
}