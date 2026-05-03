import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('room_tags', (table) => {
      table.enum('type', ['inclusion', 'preference']).notNullable().defaultTo('inclusion')
    })
  }

  async down() {
    this.schema.alterTable('room_tags', (table) => {
      table.dropColumn('type')
    })
  }
}