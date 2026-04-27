import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Room from '#models/room'
import Student from '#models/student'
import FileMetadata from '#models/file_metadatum'

export default class TransientBooking extends BaseModel {
  static table = 'transient_bookings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roomId: number

  @column()
  declare studentNumber: string

  @column()
  declare checkInDate: string

  @column()
  declare checkOutDate: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare paymentDeadline: DateTime

  @column()
  declare proofFileId: number | null

  @column()
  declare status: 'pending_payment' | 'pending_verification' | 'confirmed' | 'rejected' | 'expired'

  @belongsTo(() => Room, { foreignKey: 'roomId' })
  declare room: BelongsTo<typeof Room>

  @belongsTo(() => Student, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => FileMetadata, { foreignKey: 'proofFileId' })
  declare proofFile: BelongsTo<typeof FileMetadata>
}