import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reviews'

  async up() {
    this.schema.alterTable('reviews', (table) => {
      table.timestamp('created_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable('reviews', (table) => {
      table.dropColumn('created_at')
    })
  }
}