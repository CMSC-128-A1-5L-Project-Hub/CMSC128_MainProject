import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'issue_reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('reporter_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.enum('reportable_type', ['manager', 'accommodation']).notNullable()

      table.integer('reportable_id').unsigned().notNullable()

      table.enum('reason', [
        //manager reasons
        'unprofessional_behavior',
        'harassment',
        'unresponsive',
        'fraudulent_activity',
        'violation_of_policies',

        //accommodation reasons
        'inaccurate_listing',
        'unsafe',
        'fraudulent_listing',
        'inappropriate_photos',
        'unavailable',
        'other'
      ]).notNullable()

      table.string('additional_details', 1000).notNullable()

      table.enum('status', [
        'pending',
        'resolved',
      ]).notNullable().defaultTo('pending')

      table.timestamp('created_at', { useTz: true})
      table.timestamp('updated_at', { useTz: true })

      table.index(['reportable_type', 'reportable_id'])
      table.index(['reporter_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}