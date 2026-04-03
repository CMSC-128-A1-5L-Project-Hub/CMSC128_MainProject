import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Landlord from '#models/landlord'
import Student from '#models/student'
import FileMetadata from '#models/file_metadatum'

export default class Report extends BaseModel {
  static table = 'reports'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare landlordId: number

  @column()
  declare studentNumber: string

  @column()
  declare reportFileId: number

  @column()
  declare reportType: 'billing' | 'assignment'

  @column.dateTime({ autoCreate: true })
  declare reportTimestamp: DateTime

  @belongsTo(() => Landlord, { foreignKey: 'userId' })
  declare landlord: BelongsTo<typeof Landlord>

  @belongsTo(() => Student, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => FileMetadata, { foreignKey: 'reportFileId' })
  declare reportFile: BelongsTo<typeof FileMetadata>
}