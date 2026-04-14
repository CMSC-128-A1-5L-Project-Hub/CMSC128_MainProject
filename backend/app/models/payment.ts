import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Fee from '#models/fee'
import FileMetadata from '#models/file_metadatum'

export default class Payment extends BaseModel {
  static table = 'payments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare feeId: number

  @column()
  declare proofFileId: number | null

  @column.dateTime({ autoCreate: true })
  declare paymentTimestamp: DateTime

  @column()
  declare paymentAmount: number

  @column()
  declare modeOfPayment: string

  @column()
  declare paymentStatus: string
  
  @belongsTo(() => Fee, { foreignKey: 'feeId' })
  declare fee: BelongsTo<typeof Fee>

  @belongsTo(() => FileMetadata, { foreignKey: 'proofFileId' })
  declare proofFile: BelongsTo<typeof FileMetadata>
}