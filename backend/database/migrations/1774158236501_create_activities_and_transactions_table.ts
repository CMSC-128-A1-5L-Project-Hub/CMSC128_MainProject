import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('documents', (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('file_id').unsigned().notNullable().unique().references('id').inTable('file_metadata')
      table.timestamp('upload_timestamp', { useTz: true }).defaultTo(this.now())
    })

    this.schema.createTable('reviews', (table) => {
      table.increments('id').primary()
      table.string('student_number').notNullable().references('student_number').inTable('students').onDelete('CASCADE')
      table.integer('accommodation_id').unsigned().notNullable().references('id').inTable('accommodations').onDelete('CASCADE')
      table.integer('rating').notNullable()
      table.string('content', 500).nullable()
    })

    this.schema.createTable('bookmarks', (table) => {
      table.increments('id').primary()
      table.string('student_number', 11).notNullable().references('student_number').inTable('students').onDelete('CASCADE')
      table.integer('accommodation_id').unsigned().notNullable().references('id').inTable('accommodations').onDelete('CASCADE')
    })

    this.schema.createTable('applications', (table) => {
      table.increments('id').primary()
      table.integer('accommodation_id').unsigned().notNullable().references('id').inTable('accommodations').onDelete('CASCADE')
      table.string('student_number', 11).notNullable().references('student_number').inTable('students').onDelete('CASCADE')
      table.timestamp('application_date', { useTz: true }).defaultTo(this.now())
      table.enum('application_room_type', ['single', 'double', 'shared']).notNullable()
      table.enum('application_stay_type', ['transient', 'non_transient']).notNullable()
      table.enum('application_status', ['pending', 'approved', 'rejected', 'cancelled', 'waitlisted', 'under_review']).notNullable()
      table.integer('duration_of_stay_days').notNullable()
      table.text('rejection_reason').nullable()
      table.timestamp('reviewed_at', { useTz: true }).nullable()
      table.integer('reviewed_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('slot_confirmed_at', { useTz: true }).nullable()
      table.timestamp('slot_confirm_deadline', { useTz: true }).nullable()
    })

    this.schema.createTable('assignments', (table) => {
      table.increments('id').primary()
      table.string('student_number', 11).notNullable().references('student_number').inTable('students').onDelete('CASCADE')
      table.integer('room_id').unsigned().notNullable().references('id').inTable('rooms').onDelete('CASCADE')
      table.date('confirmed_date').notNullable()
      table.date('move_in').notNullable()
      table.date('expected_move_out').notNullable()
      table.date('actual_move_out').nullable()
      table.integer('grace_period_days').notNullable().defaultTo(5)
    })

    this.schema.createTable('reports', (table) => {
      table.increments('id').primary()
      table.integer('landlord_id').unsigned().notNullable().references('user_id').inTable('landlords').onDelete('CASCADE')
      table.string('student_number', 11).notNullable().references('student_number').inTable('students').onDelete('CASCADE')
      table.integer('report_file_id').unsigned().notNullable().unique().references('id').inTable('file_metadata')
      table.enum('report_type', ['billing', 'assignment']).notNullable()
      table.timestamp('report_timestamp', { useTz: true }).defaultTo(this.now())
    })

    this.schema.createTable('fees', (table) => {
      table.increments('id').primary()
      table.integer('landlord_id').unsigned().notNullable().references('user_id').inTable('landlords').onDelete('CASCADE')
      table.string('student_number', 11).notNullable().references('student_number').inTable('students').onDelete('CASCADE')
      table.date('due_date').notNullable()
      table.enum('fee_category', ['rent', 'utilities', 'miscellaneous']).notNullable()
      table.decimal('fee_amount', 10, 2).notNullable()
      table.decimal('fee_balance', 10, 2).notNullable()
      table.enum('fee_status', ['paid', 'unpaid', 'overdue', 'partial']).notNullable()
    })

    this.schema.createTable('payments', (table) => {
      table.increments('id').primary()
      table.integer('fee_id').unsigned().notNullable().references('id').inTable('fees').onDelete('CASCADE')
      table.integer('proof_file_id').unsigned().notNullable().unique().references('id').inTable('file_metadata')
      table.timestamp('payment_timestamp', { useTz: true }).defaultTo(this.now())
      table.decimal('payment_amount', 10, 2).notNullable()
      table.string('mode_of_payment', 30).notNullable()
      table.enum('payment_status', ['pending', 'verified', 'rejected']).defaultTo('pending')
    })

    this.schema.createTable('logs', (table) => {
      table.increments('id').primary()
      table.integer('actor_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.enum('entity_type', ['application', 'assignment', 'payment', 'room', 'accommodation', 'document', 'report', 'fee', 'account']).notNullable()
      table.integer('entity_id').notNullable()
      table.timestamp('log_timestamp', { useTz: true }).defaultTo(this.now())
      table.string('activity_type', 50).notNullable()
      table.string('activity_details', 200).nullable()
      table.index(['entity_type', 'entity_id'])
    })

    this.schema.createTable('notifications', (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.text('notification_content').notNullable()
      table.enum('read_status', ['read', 'unread']).defaultTo('unread')
      table.enum('notification_type', ['fee_due', 'application_status', 'system', 'other']).notNullable()
      table.timestamp('notification_timestamp', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable('notifications')
    this.schema.dropTable('logs')
    this.schema.dropTable('payments')
    this.schema.dropTable('fees')
    this.schema.dropTable('reports')
    this.schema.dropTable('assignments')
    this.schema.dropTable('applications')
    this.schema.dropTable('bookmarks')
    this.schema.dropTable('reviews')
    this.schema.dropTable('documents')
  }
}