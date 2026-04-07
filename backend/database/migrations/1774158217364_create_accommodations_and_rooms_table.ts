import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('accommodations', (table) => {
      table.increments('id').primary()
      table.integer('landlord_id').unsigned().notNullable().references('user_id').inTable('landlords').onDelete('CASCADE')
      table.integer('manager_id').unsigned().notNullable().unique().references('user_id').inTable('managers').onDelete('CASCADE')
      table.integer('business_permit_id').unsigned().notNullable().unique().references('id').inTable('file_metadata')
      table.string('accommodation_name', 50).notNullable().unique()
      table.string('accommodation_location', 150).notNullable()
      table.decimal('longitude', 9, 6).nullable()
      table.decimal('latitude', 9, 6).nullable()
      table.integer('walking_distance').nullable()
      table.integer('biking_distance').nullable()
      table.integer('driving_distance').nullable()
      table.enum('accommodation_type', ['on-campus', 'off-campus', 'partner_housing']).notNullable()
      table.enum('status', ['pending', 'verified', 'rejected']).nullable() // change this to notNullable in the final version
      table.integer('accommodation_capacity').notNullable()
      table.enum('tenant_restriction', ['male-only', 'female-only', 'coed']).notNullable()
      table.date('application_start_date').notNullable()
      table.date('application_end_date').notNullable()
    })

    this.schema.createTable('accommodation_tags', (table) => {
      table.increments('id').primary()
      table.integer('accommodation_id').unsigned().notNullable().references('id').inTable('accommodations').onDelete('CASCADE')
      table.string('tag_detail', 30).notNullable()
      table.index(['tag_detail', 'accommodation_id'])
    })

    this.schema.createTable('accommodation_images', (table) => {
      table.increments('id').primary()
      table.integer('accommodation_id').unsigned().notNullable().references('id').inTable('accommodations').onDelete('CASCADE')
      table.integer('image_file_id').unsigned().notNullable().unique().references('id').inTable('file_metadata')
    })

    this.schema.createTable('rooms', (table) => {
      table.increments('id').primary()
      table.integer('accommodation_id').unsigned().notNullable().references('id').inTable('accommodations').onDelete('CASCADE')
      table.string('room_number', 5).notNullable()
      table.enum('room_type', ['single', 'double', 'shared']).notNullable()
      table.enum('room_stay_type', ['transient', 'non_transient']).notNullable()
      table.integer('room_capacity').notNullable()
      table.integer('room_current_occupancy').notNullable()
      table.string('room_building', 20).notNullable()
      table.decimal('room_rent', 10, 2).notNullable()
      table.enum('tenant_restriction', ['coed', 'non-coed']).notNullable()
      table.enum('room_availability', ['available', 'occupied', 'maintenance']).notNullable()
    })
  }

  async down() {
    this.schema.dropTable('rooms')
    this.schema.dropTable('accommodation_images')
    this.schema.dropTable('accommodation_tags')
    this.schema.dropTable('accommodations')
  }
}