import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up(){
    // file_metadata table
    this.schema.createTable('file_metadata', (table) => {
      table.bigIncrements('id').primary()
      table.string('name', 100).notNullable()
      table.string('path', 500).notNullable()
      table.enum('type', ['document', 'image']).notNullable()
    })
  }

  async down(){
    this.schema.dropTable('file_metadata')
  }

}