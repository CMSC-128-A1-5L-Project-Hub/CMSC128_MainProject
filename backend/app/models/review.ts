import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Accommodation from '#models/accommodation'
import Student from '#models/student'

export default class Review extends BaseModel {
  static table = 'reviews'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare accommodationId: number

  @column()
  declare studentNumber: string

  @column()
  declare rating: number

  @column()
  declare content: string | null

  @belongsTo(() => Accommodation, { foreignKey: 'accommodationId' })
  declare accommodation: BelongsTo<typeof Accommodation>

  @belongsTo(() => Student, { foreignKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>
}