import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('first_name', 50).notNullable()
      table.string('middle_name', 50).nullable()
      table.string('last_name', 50).notNullable()
      table.string('suffix', 10).nullable()
      table.string('email', 75).notNullable().unique()
      // Added 'unassigned' for our initial account creation
      table.enum('role', ['unassigned', 'student', 'landlord', 'manager']).defaultTo('unassigned')
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}