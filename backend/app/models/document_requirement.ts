import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Accommodation from '#models/accommodation'

export default class DocumentRequirement extends BaseModel {
  static table = 'accommodation_document_requirements'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare accommodationId: number

  @column()
  declare requirementName: string

  @column()
  declare acceptedFormat: 'pdf' | 'image' | 'any'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Accommodation, { foreignKey: 'accommodationId' })
  declare accommodation: BelongsTo<typeof Accommodation>
}
