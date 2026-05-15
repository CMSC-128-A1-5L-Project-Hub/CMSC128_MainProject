import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('application_documents', (table) => {
      table.increments('id').primary()
      table.integer('application_id').unsigned().notNullable()
        .references('id').inTable('applications').onDelete('CASCADE')
      table.integer('document_requirement_id').unsigned().nullable()
        .references('id').inTable('accommodation_document_requirements').onDelete('SET NULL')
      table.integer('file_id').unsigned().notNullable()
        .references('id').inTable('file_metadata').onDelete('CASCADE')
      table.string('requirement_name', 100).notNullable()
      table.timestamps(true, true)
      table.index(['application_id'])
    })
  }

  async down() {
    this.schema.dropTable('application_documents')
  }
}
