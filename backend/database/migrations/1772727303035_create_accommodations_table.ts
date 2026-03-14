import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('accommodations', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('landlord_id').unsigned().notNullable().references('user_id').inTable('landlords')
      table.bigInteger('manager_id').unsigned().notNullable().references('user_id').inTable('managers')
      table.bigInteger('business_permit_id').unsigned().unique().references('id').inTable('file_metadata').onDelete('CASCADE')
      table.string('name', 50).notNullable().unique()
      table.string('location', 150).notNullable()
      table.enum('type', ['on-campus', 'off-campus', 'partner_housing']).notNullable()
      table.integer('capacity').notNullable()
      table.enum('tenant_restriction', ['male-only', 'female-only', 'coed']).notNullable()
      table.date('application_start_date').notNullable()
      table.date('application_end_date').notNullable()
      table.timestamps(true)
    })

    this.schema.createTable('rooms', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('accommodation_id').unsigned().notNullable().references('id').inTable('accommodations').onDelete('CASCADE')
      table.string('room_number', 5).notNullable()
      table.enum('type', ['single', 'double', 'shared']).notNullable()
      table.integer('capacity').notNullable()
      table.integer('current_occupancy').defaultTo(0)
      table.string('building', 20).notNullable()
      table.decimal('rent', 10, 2).notNullable()
      table.enum('tenant_restriction', ['coed', 'non-coed']).notNullable()
      table.enum('availability', ['available', 'occupied', 'maintenance']).defaultTo('available')
    })
  }

  async down() {
    this.schema.dropTable('rooms')
    this.schema.dropTable('accommodations')
  }
}