// app/models/early_move_out_request.ts

import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Assignment from '#models/assignment'
import Student from '#models/student'

export default class EarlyMoveOutRequest extends BaseModel {
  static table = 'early_move_out_requests'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare assignmentId: number

  @column()
  declare studentNumber: string

  @column.date()
  declare requestedMoveOutDate: DateTime

  @column()
  declare reason: string

  @column()
  declare status: 'pending' | 'approved' | 'rejected'

  @column()
  declare reviewedBy: number | null

  @column.dateTime()
  declare reviewedAt: DateTime | null

  @column()
  declare adminRemark: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Assignment, { foreignKey: 'assignmentId' })
  declare assignment: BelongsTo<typeof Assignment>

  @belongsTo(() => Student, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>
}