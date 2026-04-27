import { BaseSchema}  from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transient_bookings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('room_id').unsigned().notNullable().references('id').inTable('rooms').onDelete('CASCADE')
      table.string('student_number', 11).notNullable().references('student_number').inTable('students').onDelete('CASCADE')
      table.date('check_in_date').notNullable()
      table.date('check_out_date').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('payment_deadline', { useTz: true }).notNullable()
      table.integer('proof_file_id').unsigned().nullable().references('id').inTable('file_metadata').onDelete('SET NULL')
      table.string('status', 20).notNullable().defaultTo('pending_payment')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}