import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accommodation_images'

  async up() {
    // accommodation_images table
    this.schema.createTable('accommodation_images', (table) =>{
      table.bigIncrements('id').primary()
      table.bigInteger('accommodation_id').unsigned().notNullable().references('id').inTable('accommodations').onDelete('CASCADE')
      table.bigInteger('image_file_id').unsigned().notNullable().unique().references('id').inTable('file_metadata')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}