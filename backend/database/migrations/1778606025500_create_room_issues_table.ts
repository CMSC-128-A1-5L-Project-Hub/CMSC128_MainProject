import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'room_issues'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('room_id').unsigned().notNullable().references('id').inTable('rooms').onDelete('CASCADE')
      table.integer('reporter_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.enum('reporter_role', ['student', 'manager']).notNullable()
      table.string('issue_details', 1000).notNullable()

      table.enum('status', ['open', 'resolved']).notNullable().defaultTo('open')

      table.integer('resolved_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('resolved_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.index(['room_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
