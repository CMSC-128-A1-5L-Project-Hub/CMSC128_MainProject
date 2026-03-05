import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('application', (table) => {
      table.increments('id').primary()
      table.integer('accommodation_id').unsigned().references('id').inTable('accommodations')
      table.string('student_number').references('student_number').inTable('students')
      table.timestamp('application_date', { useTz: true }).defaultTo(this.now())
      table.enum('room_type', ['single', 'double', 'shared']).notNullable()
      table.enum('status', ['pending', 'approved', 'rejected', 'cancelled', 'waitlisted', 'under_review']).defaultTo('pending')
      table.integer('duration_of_stay_days').notNullable()
    })

    this.schema.createTable('document', (table) => {
      table.increments('id').primary()
      table.integer('application_id').unsigned().references('id').inTable('applications').onDelete('CASCADE')
      table.string('name', 50).notNullable()
      table.specificType('file', 'MEDIUMBLOB').notNullable() // don't know what mediumblob is...
    })

    this.schema.createTable('assignment', (table) => {
      table.increments('id').primary()
      table.string('student_number').references('student_number').inTable('students')
      table.integer('room_id').unsigned().references('id').inTable('rooms')
      table.date('move_in').notNullable()
      table.date('expected_move_out').notNullable()
      table.date('actual_move_out').nullable()
    })
  }
}