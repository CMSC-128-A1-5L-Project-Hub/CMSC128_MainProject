import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import FileMetadata from '#models/file_metadata'

export default class Document extends BaseModel {
  static table = 'documents'

  @column({ isPrimary: true })
  declare documentId: number

  @column()
  declare userId: number

  @column()
  declare fileId: number

  @column.dateTime()
  declare uploadTimestamp: DateTime

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => FileMetadata, { foreignKey: 'fileId', localKey: 'fileId' })
  declare file: BelongsTo<typeof FileMetadata>
}
