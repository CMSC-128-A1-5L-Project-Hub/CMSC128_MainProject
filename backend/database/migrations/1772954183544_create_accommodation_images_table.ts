import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('accommodation_images', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('accommodation_id').unsigned().notNullable()
           .references('id').inTable('accommodations').onDelete('CASCADE')
      table.bigInteger('file_id').unsigned().notNullable().unique()
           .references('id').inTable('file_metadata')
    })
  }

  async down() {
    this.schema.dropTable('accommodation_images')
  }
}