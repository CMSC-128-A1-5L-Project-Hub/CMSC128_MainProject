import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare upMail: string // make sure this is unique in the migrations to prevent multiple accounts with the same email.

  @column()
  declare role: string // Default student
}
