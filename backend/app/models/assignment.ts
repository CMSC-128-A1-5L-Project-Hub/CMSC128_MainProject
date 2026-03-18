import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'
import Room from '#models/room'

export default class Assignment extends BaseModel {
  static table = 'assignments'

  @column({ isPrimary: true })
  declare assignmentId: number

  @column()
  declare studentNumber: string

  @column()
  declare roomId: number

  @column.date()
  declare moveIn: DateTime

  @column.date()
  declare expectedMoveOut: DateTime

  @column.date()
  declare actualMoveOut: DateTime | null

  @column()
  declare gracePeriodDays: number

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Student, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Room, { foreignKey: 'roomId' })
  declare room: BelongsTo<typeof Room>
}