import { BaseModel, column, belongsTo, hasOne, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne, HasMany } from '@adonisjs/lucid/types/relations'
import FileMetadata from '#models/file_metadatum'
import Landlord from '#models/landlord'
import Manager from '#models/manager'
import Student from '#models/student'
import PhoneNumber from '#models/phone_number'

export default class User extends BaseModel {
  static table = 'users'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pfpFileId: number | null

  @column()
  declare fname: string

  @column()
  declare mname: string | null

  @column()
  declare lname: string

  @column()
  declare suffix: string | null

  @column()
  declare email: string

  @column()
  declare facebookAccount: string | null

  @column()
  declare role: 'student' | 'landlord' | 'manager' | 'unassigned' | 'super_admin'

  @belongsTo(() => FileMetadata, { foreignKey: 'pfpFileId' })
  declare profilePicture: BelongsTo<typeof FileMetadata>

  @hasOne(() => Landlord, { foreignKey: 'userId' })
  declare landlord: HasOne<typeof Landlord>

  @hasOne(() => Manager, { foreignKey: 'userId' })
  declare manager: HasOne<typeof Manager>

  @hasOne(() => Student, { foreignKey: 'userId' })
  declare student: HasOne<typeof Student>

  @hasMany(() => PhoneNumber, { foreignKey: 'userId' })
  declare phoneNumbers: HasMany<typeof PhoneNumber>
}