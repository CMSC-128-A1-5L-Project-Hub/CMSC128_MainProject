import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('applications', (table) => {
      table.integer('room_id').unsigned().nullable()
        .references('id').inTable('rooms')
        .onDelete('SET NULL')

      table.date('move_in_date').nullable()
      table.date('move_out_date').nullable()
      table.decimal('reservation_fee', 10, 2).nullable()
      table.decimal('move_in_fee', 10, 2).nullable()
    })
  }

  async down() {
    this.schema.alterTable('applications', (table) => {
      table.dropForeign(['room_id'])
      table.dropColumn('room_id')
      table.dropColumn('move_in_date')
      table.dropColumn('move_out_date')
      table.dropColumn('reservation_fee')
      table.dropColumn('move_in_fee')
    })
  }
}