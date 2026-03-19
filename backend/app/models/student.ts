import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import FileMetadata from '#models/file_metadata'
import Application from '#models/application'
import Assignment from '#models/assignment'
import Bookmark from '#models/bookmark'

export default class Student extends BaseModel {
  static table = 'students' // follow migration table name

  // PK is student_number (string), not an integer
  @column({ isPrimary: true })
  declare studentNumber: string

  @column()
  declare userId: number

  @column()
  declare enrollmentProofFileId: number

  @column()
  declare college: string

  @column()
  declare degreeProgram: string

  @column()
  declare gender: string

  @column()
  declare emergencyContactName: string | null

  @column()
  declare emergencyContactNumber: string | null

  // ─── Relationships ────────────────────────────────────────────────────────
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => FileMetadata, { foreignKey: 'enrollmentProofFileId', localKey: 'fileId' })
  declare enrollmentProof: BelongsTo<typeof FileMetadata>

  @hasMany(() => Application, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare applications: HasMany<typeof Application>

  @hasMany(() => Assignment, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare assignments: HasMany<typeof Assignment>

  @hasMany(() => Bookmark, { foreignKey: 'studentNumber', localKey: 'studentNumber' })
  declare bookmarks: HasMany<typeof Bookmark>
}
