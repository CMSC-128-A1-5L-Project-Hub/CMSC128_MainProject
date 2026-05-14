import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Room from './room.ts'
import User from './user.ts'

export default class RoomIssue extends BaseModel {
  static table = 'room_issues'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roomId: number

  @column()
  declare reporterId: number

  @column()
  declare reporterRole: 'student' | 'manager'

  @column()
  declare issueDetails: string

  @column()
  declare status: 'open' | 'resolved'

  @column()
  declare resolvedBy: number | null

  @column.dateTime()
  declare resolvedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Room, { foreignKey: 'roomId' })
  declare room: BelongsTo<typeof Room>

  @belongsTo(() => User, { foreignKey: 'reporterId' })
  declare reporter: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'resolvedBy' })
  declare resolver: BelongsTo<typeof User>
}
