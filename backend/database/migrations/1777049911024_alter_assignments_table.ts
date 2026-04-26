import {BaseSchema} from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'assignments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('confirmation_status', [
          'pending_confirmation',
          'active',
          'rejected',
          'cancelled',
        ])
        .notNullable()
        .defaultTo('pending_confirmation')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('confirmation_status')
    })
  }
}