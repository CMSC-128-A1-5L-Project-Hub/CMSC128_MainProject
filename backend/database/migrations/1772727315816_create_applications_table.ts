import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('applications', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('accommodation_id').unsigned().references('id').inTable('accommodations')
      table.string('student_number').references('student_number').inTable('students')
      table.timestamp('application_date', { useTz: true }).defaultTo(this.now())
      table.enum('room_type', ['single', 'double', 'shared']).notNullable()
      table
        .enum('status', [
          'pending',
          'approved',
          'rejected',
          'cancelled',
          'waitlisted',
          'under_review',
        ])
        .defaultTo('pending')
      table.integer('duration_of_stay_days').notNullable()
    })

    this.schema.createTable('documents', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.bigInteger('file_id').unsigned().notNullable().references('id').inTable('file_metadata').onDelete('CASCADE')
      table.timestamp('upload_timestamp')
    })

    this.schema.createTable('assignments', (table) => {
      table.bigIncrements('id').primary()
      table.string('student_number').references('student_number').inTable('students')
      table.bigInteger('room_id').unsigned().references('id').inTable('rooms')
      table.date('move_in').notNullable()
      table.date('expected_move_out').notNullable()
      table.date('actual_move_out').nullable()
    })
  }
}
