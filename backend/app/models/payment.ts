import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Fee from '#models/fee'
import FileMetadata from '#models/file_metadata'

export default class Payment extends BaseModel {
  static table = 'payments'

  @column({ isPrimary: true })
  declare paymentId: number

  @column()
  declare feeId: number

  @column()
  declare proofFileId: number

  @column.dateTime()
  declare paymentTimestamp: DateTime

  @column()
  declare paymentAmount: number

  @column()
  declare modeOfPayment: string

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Fee, { foreignKey: 'feeId' })
  declare fee: BelongsTo<typeof Fee>

  @belongsTo(() => FileMetadata, { foreignKey: 'proofFileId', localKey: 'fileId' })
  declare proofFile: BelongsTo<typeof FileMetadata>
}