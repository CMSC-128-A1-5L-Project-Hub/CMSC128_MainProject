import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('phone_numbers', (table) => {
      table.dropUnique(['contact_number'])
    })
  }

  async down() {
    this.schema.alterTable('phone_numbers', (table) => {
      table.unique(['contact_number'])
    })
  }
}
