import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'
import Accommodation from '#models/accommodation'

export default class Bookmark extends BaseModel {
  static table = 'bookmark'

  @column({ isPrimary: true })
  declare bookmarkId: number

  @column()
  declare studentNumber: string

  @column()
  declare accommodationId: number

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => Student, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Accommodation, { foreignKey: 'accommodationId' })
  declare accommodation: BelongsTo<typeof Accommodation>
}
