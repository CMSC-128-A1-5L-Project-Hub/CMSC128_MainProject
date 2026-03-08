import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Landlord from '#models/landlord'
import Student from '#models/student'
import FileMetadata from '#models/file_metadata'
import { DateTime } from 'luxon'

export default class Report extends BaseModel {
  static table = 'report'

  @column({ isPrimary: true })
  declare reportId: number

  @column()
  declare landlordId: number

  @column()
  declare studentNumber: string

  @column()
  declare reportFileId: number

  @column()
  declare reportType: 'billing' | 'assignment'

  @column.dateTime()
  declare reportTimestamp: DateTime

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Landlord, { foreignKey: 'landlordId' })
  declare landlord: BelongsTo<typeof Landlord>

  @belongsTo(() => Student, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => FileMetadata, { foreignKey: 'reportFileId', localKey: 'fileId' })
  declare reportFile: BelongsTo<typeof FileMetadata>
}