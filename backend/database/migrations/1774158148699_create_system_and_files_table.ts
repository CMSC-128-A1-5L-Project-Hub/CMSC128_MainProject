import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('file_metadata', (table) => {
      table.increments('id').primary()
      table.string('file_name', 100).notNullable()
      table.string('file_path', 500).notNullable()
      table.enum('file_type', ['document', 'image']).notNullable()
    })

    this.schema.createTable('sys_variables', (table) => {
      table.increments('id').primary()
      table.enum('current_semester', ['first_sem', 'second_sem', 'midyear']).notNullable()
      table.string('current_sy', 9).notNullable()
      table.date('sem_start_date').notNullable()
      table.decimal('uplb_latitude', 9, 6).notNullable()
      table.decimal('uplb_longitude', 9, 6).notNullable()
    })
  }

  async down() {
    this.schema.dropTable('sys_variables')
    this.schema.dropTable('file_metadata')
  }
}