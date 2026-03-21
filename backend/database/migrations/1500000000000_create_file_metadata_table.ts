import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'file_metadata'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.string('file_name', 100).notNullable()
      table.string('file_path', 500).notNullable()
      table.enum('file_type', ['document', 'image']).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
