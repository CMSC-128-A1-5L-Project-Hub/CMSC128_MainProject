import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accommodations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('contract_months').defaultTo(6).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('contract_months')
    })
  }
}