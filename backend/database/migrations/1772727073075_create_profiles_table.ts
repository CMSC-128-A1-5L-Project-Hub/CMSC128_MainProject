import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('students', (table) => {
      table.string('student_number', 10).primary()
      table
        .bigInteger('user_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .bigInteger('enrollment_proof_file_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('file_metadata')

      // Data Fields
      table.string('degree_program').notNullable() // e.g., BS Computer Science
      table.string('college').notNullable() // e.g., CAS
      table.string('gender').notNullable()
      table.string('contact_number', 11).notNullable()
      table.string('emergency_contact_name').notNullable()
      table.string('emergency_contact_number', 11).notNullable()

      table.timestamps(true)
    })

    this.schema.createTable('landlords', (table) => {
      table.bigIncrements('id').primary()
      table
        .bigInteger('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('tin', 15).notNullable()

      table.timestamps(true)
    })

    this.schema.createTable('managers', (table) => {
      table.bigIncrements('id').primary()
      table
        .bigInteger('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.enum('status', ['active', 'inactive']).defaultTo('inactive')
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable('managers')
    this.schema.dropTable('landlords')
    this.schema.dropTable('students')
  }
}
