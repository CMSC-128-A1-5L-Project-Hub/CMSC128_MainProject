import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('users', (table) => {
      table.increments('id').primary()
      table.integer('pfp_file_id').unsigned().nullable().references('id').inTable('file_metadata').onDelete('RESTRICT')
      table.string('fname', 50).notNullable()
      table.string('mname', 50).nullable()
      table.string('lname', 50).notNullable()
      table.string('suffix', 10).nullable()
      table.string('email', 75).notNullable().unique()
      table.string('facebook_account', 100).nullable()
      table.enum('role', ['student', 'landlord', 'manager', 'unassigned', 'super_admin']).notNullable().defaultTo('unassigned')
      table.enum('account_status', ['pending', 'active', 'suspended', 'initial']).defaultTo('initial')
      table.string('otp_code', 50).nullable()
      table.timestamp('otp_expires_at', { useTz: true }).nullable()
    })

    this.schema.createTable('phone_numbers', (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('contact_number', 11).notNullable().unique()
      table.boolean('is_primary').defaultTo(false)
    })

    this.schema.createTable('landlords', (table) => {
      table.integer('user_id').unsigned().primary().notNullable().unique().references('id').inTable('users').onDelete('CASCADE')
      table.string('tin', 15).notNullable()
    })

    this.schema.createTable('managers', (table) => {
      table.integer('user_id').unsigned().notNullable().primary().unique().references('id').inTable('users').onDelete('CASCADE')
      table.enum('manager_status', ['active', 'inactive']).notNullable().defaultTo('inactive')
    })

    this.schema.createTable('students', (table) => {
      table.string('student_number', 11).primary()
      table.integer('user_id').unsigned().notNullable().unique().references('id').inTable('users').onDelete('CASCADE')
      table.integer('enrollment_proof_file_id').unsigned().notNullable().unique().references('id').inTable('file_metadata')
      table.string('college', 5).notNullable()
      table.string('degree_program', 50).notNullable()
      table.string('gender', 10).notNullable()
      table.string('emergency_contact_name', 100).nullable()
      table.string('emergency_contact_number', 11).nullable()
      table.boolean('form5_renewal').defaultTo(false)
    })
  }

  async down() {
    this.schema.dropTable('students')
    this.schema.dropTable('managers')
    this.schema.dropTable('landlords')
    this.schema.dropTable('phone_numbers')
    this.schema.dropTable('users')
  }
}