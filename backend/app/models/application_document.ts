import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Application from '#models/application'
import FileMetadata from '#models/file_metadatum'
import DocumentRequirement from '#models/document_requirement'

export default class ApplicationDocument extends BaseModel {
  static table = 'application_documents'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare applicationId: number

  @column()
  declare documentRequirementId: number | null

  @column()
  declare fileId: number

  @column()
  declare requirementName: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Application, { foreignKey: 'applicationId' })
  declare application: BelongsTo<typeof Application>

  @belongsTo(() => FileMetadata, { foreignKey: 'fileId' })
  declare file: BelongsTo<typeof FileMetadata>

  @belongsTo(() => DocumentRequirement, { foreignKey: 'documentRequirementId' })
  declare documentRequirement: BelongsTo<typeof DocumentRequirement>
}
