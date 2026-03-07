import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('student', (table) => {
      // Primary Key linked to Users table
      table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
      
      // Data Fields
      table.string('student_number').notNullable().unique()
      table.string('course').notNullable()
      table.string('college').notNullable()
      table.string('emergency_contact').notNullable()
      table.string('gender').notNullable()

      // GCS File Paths (Storing the URL/Path)
      table.string('form_5_path').nullable() 
      table.string('uplb_id_path').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('landlord', (table) => {
      table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
      
      // Data Fields
      table.string('tin').notNullable()
      table.string('accommodation_name').notNullable()
      table.string('business_address').notNullable()
      table.string('contact_number').notNullable()

      // GCS File Path
      table.string('business_permit_path').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('manager', (table) => {
      table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
    })
  }
  
  async down() {
    this.schema.dropTable('student')
    this.schema.dropTable('landlord')
  }
}