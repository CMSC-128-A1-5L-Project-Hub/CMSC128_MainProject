import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table
        .bigInteger('actor_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .enum('entity_type', [
          'application',
          'assignment',
          'payment',
          'room',
          'accommodation',
          'document',
          'report',
          'fee',
        ])
        .notNullable()
      table.integer('entity_id').notNullable()
      table.timestamp('timestamp', { useTz: true }).defaultTo(this.now())
      table.string('activity_type', 50).notNullable()
      table.string('activity_details', 200).nullable()

      table.index(['entity_type', 'entity_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
