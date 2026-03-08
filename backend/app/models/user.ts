import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'


export default class User extends compose(BaseModel, withAuthFinder(hash)) {

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare first_name: string
  
  @column()
  declare middle_name: string
  
  @column()
  declare last_name: string

  @column()
  declare email: string

  @column()
  declare role: string

  @column.dateTime({ autoCreate: true})
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true})
  declare updatedAt: DateTime

  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken
    user: Date
}