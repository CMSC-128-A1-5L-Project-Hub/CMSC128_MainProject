import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class Notification extends BaseModel {
  static table = 'notification'

  @column({ isPrimary: true })
  declare notificationId: number

  @column()
  declare userId: number

  @column()
  declare notificationContent: string

  @column()
  declare readStatus: 'read' | 'unread'

  @column()
  declare notificationType: 'fee_due' | 'application_status' | 'system' | 'other'

  @column.dateTime()
  declare notificationTimestamp: DateTime

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}