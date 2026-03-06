import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('student', (table) => {
      table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
      table.string('student_number').notNullable().unique() // 20XX-XXXX format
      table.string('course').notNullable()
      table.string('college').notNullable()
      table.string('emergency_contact').notNullable()
      table.string('gender').notNullable()
      table.text('form_5_base64', 'longtext') // Storing the files in Base64 for now
      table.text('uplb_id_base64', 'longtext') // Storing the files in Base64 for now
    })

    this.schema.createTable('landlord', (table) => {
      table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
      table.string('tin').notNullable()
      table.string('accommodation_name').notNullable()
      table.string('business_address').notNullable()
      table.string('contact_number').notNullable()
      table.text('business_permit_base64', 'longtext') // Storing the files in Base64 for now
    })

  this.schema.createTable('manager', (table) => {
      table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
    })
  }
}