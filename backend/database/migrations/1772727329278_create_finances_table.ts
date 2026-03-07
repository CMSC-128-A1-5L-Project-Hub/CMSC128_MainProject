import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('fees', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('landlord_id').unsigned().references('user_id').inTable('landlords')
      table.string('student_number').references('student_number').inTable('students')
      table.date('due_date').notNullable()
      table.enum('category', ['rent', 'utilities', 'miscellaneous']).notNullable()
      table.decimal('amount', 10, 2).notNullable()
      table.enum('status', ['paid', 'unpaid', 'overdue', 'partial']).defaultTo('unpaid')
    })

    this.schema.createTable('payments', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('fee_id').unsigned().references('id').inTable('fees')
      table.timestamp('timestamp', { useTz: true }).defaultTo(this.now())
      table.decimal('amount', 10, 2).notNullable()
      table.string('mode_of_payment', 30).notNullable()
    })

    this.schema.createTable('reports', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('landlord_id').unsigned().references('user_id').inTable('landlords')
      table.string('student_number').references('student_number').inTable('students')
      table.enum('type', ['billing', 'assignment']).notNullable()
      table.timestamp('timestamp', { useTz: true }).defaultTo(this.now())
      table.specificType('file', 'MEDIUMBLOB').notNullable()
    })
  }
}