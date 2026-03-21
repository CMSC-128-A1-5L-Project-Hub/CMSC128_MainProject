import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class FileMetadata extends BaseModel {
  static table = 'file_metadata'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fileName: string

  @column()
  declare filePath: string

  @column()
  declare fileType: 'document' | 'image'
}
