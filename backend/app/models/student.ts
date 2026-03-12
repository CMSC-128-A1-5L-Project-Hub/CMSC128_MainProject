import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Student extends BaseModel {
  @column({ isPrimary: true })
  declare studentNumber: string

  @column()
  declare userId: number

  @column()
  declare course: string

  @column()
  declare college: string

  @column()
  declare gender: string

  @column()
  declare contactNumber: string

  @column()
  declare emergencyContactName: string

  @column()
  declare emergencyContactNumber: string

  @column()
  declare enrollmentProofId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
} 