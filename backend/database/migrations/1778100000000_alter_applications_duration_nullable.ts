import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('applications', (table) => {
      table.integer('duration_of_stay_days').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable('applications', (table) => {
      table.integer('duration_of_stay_days').notNullable().alter()
    })
  }
}
