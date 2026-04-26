// app/models/application.ts
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Accommodation from '#models/accommodation'
import Student from '#models/student'
import User from '#models/user'

export default class Application extends BaseModel {
  static table = 'applications'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare accommodationId: number

  @column()
  declare studentNumber: string

  @column.dateTime({ autoCreate: true })
  declare applicationDate: DateTime

  @column()
  declare applicationRoomType: 'single' | 'double' | 'shared'

  @column()
  declare applicationStayType: 'transient' | 'non_transient'

  @column()
  declare rejectionReason: string | null

  @column()
  declare applicationStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted' | 'under_review' | 'confirmed'

  @column()
  declare durationOfStayDays: number

  // ─── NEW COLUMNS ────────────────────────────────────────────────
  @column()
  declare preferredTags: string[] | null   // holds the student's preferred tag list

  @column.dateTime()
  declare approvedAt: DateTime | null      // set when the application becomes 'approved'

  @column.dateTime()
  declare reviewedAt: DateTime | null

  @column()
  declare reviewedBy: number | null

  @belongsTo(() => Accommodation, { foreignKey: 'accommodationId' })
  declare accommodation: BelongsTo<typeof Accommodation>

  @belongsTo(() => Student, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'reviewedBy' })
  declare reviewer: BelongsTo<typeof User>
}