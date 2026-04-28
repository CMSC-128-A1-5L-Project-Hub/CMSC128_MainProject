import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fees'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('allow_installments').defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('allow_installments')
    })
  }
}