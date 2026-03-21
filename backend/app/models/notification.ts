import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Notification extends BaseModel {
  static table = 'notifications'

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
