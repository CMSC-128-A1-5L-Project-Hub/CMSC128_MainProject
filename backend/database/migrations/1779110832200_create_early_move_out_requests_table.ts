// database/migrations/xxxx_create_early_move_out_requests_table.ts

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'early_move_out_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('assignment_id').unsigned().notNullable()
      table.string('student_number').notNullable()
      table.date('requested_move_out_date').notNullable()
      table.text('reason').notNullable()
      table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending')
      table.integer('reviewed_by').unsigned().nullable()
      table.timestamp('reviewed_at').nullable()
      table.text('admin_remark').nullable()
      table.timestamps(true, true)

      table.foreign('assignment_id').references('assignments.id').onDelete('CASCADE')
      table.foreign('student_number').references('students.student_number').onDelete('CASCADE')
      table.foreign('reviewed_by').references('users.id').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}