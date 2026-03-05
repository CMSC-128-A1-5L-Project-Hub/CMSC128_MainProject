import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {

  @column({ isPrimary: true })
  public id: number

  @column()
  public first_name: string

  @column()
  public last_name: string

  @column()
  public up_mail: string

  @column()
  public role: string

  @column.dateTime({ autoCreate: true})
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true})
  public updatedAt: DateTime

  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken
    user: Date

  // get initials() {
  //   const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
  //   if (first && last) {
  //     return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  //   }
  //   return `${first.slice(0, 2)}`.toUpperCase()
  // }
}
