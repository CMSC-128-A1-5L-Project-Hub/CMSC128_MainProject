import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('sys_variables', (table) => {
      table.boolean('auto_verify_users').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable('sys_variables', (table) => {
      table.dropColumn('auto_verify_users')
    })
  }
}
