import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'
import Accommodation from '#models/accommodation'

export default class Bookmark extends BaseModel {
  static table = 'bookmarks'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare studentNumber: string

  @column()
  declare accommodationId: number

  @belongsTo(() => Student, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Accommodation, { foreignKey: 'accommodationId' })
  declare accommodation: BelongsTo<typeof Accommodation>
}