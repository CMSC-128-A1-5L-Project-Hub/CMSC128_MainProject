import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('accommodations', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('landlord_id').unsigned().nullable().references('user_id').inTable('landlords').onDelete('CASCADE')
      table.bigInteger('manager_id').unsigned().references('user_id').inTable('managers')
      table.string('name', 50).notNullable().unique()
      table.string('location', 150).notNullable()
      table.enum('type', ['on-campus', 'off-campus', 'partner_housing']).notNullable()
      table.integer('capacity').notNullable()
      table.timestamps(true)
    })

    this.schema.createTable('rooms', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('accommodation_id').unsigned().nullable().references('id').inTable('accommodations').onDelete('CASCADE')
      table.string('room_number', 5).notNullable()
      table.enum('type', ['single', 'double', 'shared']).notNullable()
      table.integer('capacity').notNullable()
      table.integer('current_occupancy').defaultTo(0)
      table.string('building', 20).notNullable()
      table.decimal('rent', 10, 2).notNullable()
      table.enum('status', ['available', 'occupied', 'maintenance']).defaultTo('available')
    })
  }

  async down() {
    this.schema.dropTable('accommodations')
    this.schema.dropTable('rooms')
  }
}