import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Accommodation from '#models/accommodation'
import Student from '#models/student'

export default class Application extends BaseModel {
  static table = 'applications'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare accommodationId: number

  @column()
  declare studentNumber: string

  @column.dateTime()
  declare applicationDate: DateTime

  @column()
  declare applicationRoomType: 'single' | 'double' | 'shared'

  @column()
  declare applicationStayType: 'transient' | 'non_transient'

  @column()
  declare applicationStatus:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'waitlisted'
    | 'under_review'

  @column()
  declare durationOfStayDays: number

  // populated when a manager or landlord rejects the application
  @column()
  declare rejectionReason: string | null

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Accommodation, { foreignKey: 'accommodationId' })
  declare accommodation: BelongsTo<typeof Accommodation>

  @belongsTo(() => Student, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>
}
