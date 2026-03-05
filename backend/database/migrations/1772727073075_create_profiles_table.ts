import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('landlord', (table) => {
      table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
    })

    this.schema.createTable('manager', (table) => {
      table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
    })

    this.schema.createTable('student', (table) => {
      table.string('student_number', 10).primary()
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
    })
  }
}