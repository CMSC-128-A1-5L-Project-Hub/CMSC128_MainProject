import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('accommodation_document_requirements', (table) => {
      table.increments('id').primary()
      table.integer('accommodation_id').unsigned().notNullable()
        .references('id').inTable('accommodations').onDelete('CASCADE')
      table.string('requirement_name', 100).notNullable()
      table.enum('accepted_format', ['pdf', 'image', 'any']).defaultTo('any')
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable('accommodation_document_requirements')
  }
}
