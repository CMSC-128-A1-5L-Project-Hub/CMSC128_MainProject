import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('pfp_id').unsigned().notNullable().unique()
           .references('id').inTable('file_metadata')
      
      table.string('first_name', 50).notNullable()
      table.string('middle_name', 50).nullable()
      table.string('last_name', 50).notNullable()
      table.string('suffix', 10).nullable()
      table.string('email', 75).notNullable().unique()
      table.string('facebook_account', 100).nullable()
      table.enum('role', ['unassigned', 'student', 'landlord', 'manager']).defaultTo('unassigned')
      table.boolean('is_verified').defaultTo(false).notNullable()
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}