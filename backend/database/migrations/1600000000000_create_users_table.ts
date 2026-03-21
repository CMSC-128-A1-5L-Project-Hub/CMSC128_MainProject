import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table
        .bigInteger('pfp_file_id')
        .unsigned()
        .nullable()
        .unique()
        .references('id')
        .inTable('file_metadata')

      table.string('fname', 50).notNullable()
      table.string('mname', 50).nullable()
      table.string('lname', 50).notNullable()
      table.string('suffix', 10).nullable()
      table.string('email', 75).notNullable().unique()
      table.string('facebook_account', 100).nullable()
      table.enum('role', ['unassigned', 'student', 'landlord', 'manager', 'super_admin']).defaultTo('unassigned')
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
