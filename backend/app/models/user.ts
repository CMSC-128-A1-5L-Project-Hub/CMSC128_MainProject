import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'
import Landlord from '#models/landlord'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pfpId: number

  @column()
  declare firstName: string

  @column()
  declare middleName: string | null

  @column()
  declare lastName: string

  @column()
  declare suffix: string | null

  @column()
  declare email: string

  @column()
  declare role: 'unassigned' | 'student' | 'landlord' | 'manager'

  @column()
  declare isVerified: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken
    user: Date
  // Relationships
  @hasOne(() => Student)
  declare student: HasOne<typeof Student>

  @hasOne(() => Landlord)
  declare landlord: HasOne<typeof Landlord>
}