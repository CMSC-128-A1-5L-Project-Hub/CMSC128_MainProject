import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accommodations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('accommodation_size').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('accommodation_size')
    })
  }
}