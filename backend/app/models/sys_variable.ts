import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class SysVariables extends BaseModel {
  static table = 'sys_variables'

  @column({ isPrimary: true })
  declare sysId: number

  @column()
  declare currentSemester: 'first_sem' | 'second_sem' | 'midyear'

  @column()
  declare currentSy: string // e.g. '2024-2025'

  @column.date()
  declare semStartDate: DateTime
}
