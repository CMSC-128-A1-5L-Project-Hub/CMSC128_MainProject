import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Accommodation from '#models/accommodation'
import Assignment from '#models/assignment'
import RoomTag from '#models/room_tag'

export default class Room extends BaseModel {
  static table = 'rooms'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare accommodationId: number

  @column()
  declare roomNumber: string

  @column()
  declare roomType: 'single' | 'double' | 'shared'

  @column()
  declare roomStayType: 'transient' | 'non_transient'

  @column()
  declare roomCapacity: number

  @column()
  declare roomCurrentOccupancy: number

  @column()
  declare roomBuilding: string

  @column()
  declare roomRent: number

  @column()
  declare tenantRestriction: 'coed' | 'non-coed'

  @column()
  declare roomAvailability: 'available' | 'occupied' | 'maintenance'


  @column()
  declare advanceMonths: number

  @column()
  declare depositMonths: number

  @belongsTo(() => Accommodation, { foreignKey: 'accommodationId' })
  declare accommodation: BelongsTo<typeof Accommodation>

  @hasMany(() => Assignment, { foreignKey: 'roomId' })
  declare assignments: HasMany<typeof Assignment>

  @hasMany(() => RoomTag, { foreignKey: 'roomId' })
  declare tags: HasMany<typeof RoomTag>
}