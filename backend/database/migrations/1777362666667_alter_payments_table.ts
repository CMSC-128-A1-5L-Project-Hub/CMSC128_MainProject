import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('proof_file_id').unsigned().nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('proof_file_id').unsigned().notNullable().alter()
    })
  }
}