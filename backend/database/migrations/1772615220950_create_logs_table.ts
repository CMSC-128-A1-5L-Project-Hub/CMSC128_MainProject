import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'log'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('actor_id').unsigned().references('id').inTable('users').onDelete('SET NULL') // set null so that when user is deleted, the logs remain
      table.enum('entity_type', ['application', 'assignment', 'payment', 'room', 'accommodation', 'document', 'report', 'fee']).notNullable()
      table.integer('entity_id').notNullable()
      table.timestamp('timestamp', { useTz: true }).defaultTo(this.now())
      table.string('activity_type', 50).notNullable()
      table.string('activity_details', 200).nullable()
      
      table.index(['entity_type', 'entity_id'])
    })
  }
}