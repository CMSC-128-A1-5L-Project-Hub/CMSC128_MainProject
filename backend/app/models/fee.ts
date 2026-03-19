import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Landlord from '#models/landlord'
import Student from '#models/student'
import Payment from '#models/payment'
import { DateTime } from 'luxon'

export default class Fee extends BaseModel {
  static table = 'fee'

  @column({ isPrimary: true })
  declare feeId: number

  @column()
  declare landlordId: number

  @column()
  declare studentNumber: string

  @column.date()
  declare dueDate: DateTime

  @column()
  declare feeCategory: 'rent' | 'utilities' | 'miscellaneous'

  @column()
  declare feeAmount: number

  @column()
  declare feeBalance: number

  @column()
  declare feeStatus: 'paid' | 'unpaid' | 'overdue' | 'partial'

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Landlord, { foreignKey: 'landlordId' })
  declare landlord: BelongsTo<typeof Landlord>

  @belongsTo(() => Student, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>

  @hasMany(() => Payment, { foreignKey: 'feeId' })
  declare payments: HasMany<typeof Payment>
}
