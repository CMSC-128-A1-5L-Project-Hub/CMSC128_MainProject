import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rooms'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('advance_months').nullable()
      table.integer('deposit_months').nullable()
      table.enum('reservation_fee_type', ['fixed', 'percentage']).nullable()
      table.decimal('reservation_fee_value', 10, 2).nullable()
      table.decimal('room_size', 8, 2).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('advance_months')
      table.dropColumn('deposit_months')
      table.dropColumn('reservation_fee_type')
      table.dropColumn('reservation_fee_value')
      table.dropColumn('room_size')
    })
  }
}