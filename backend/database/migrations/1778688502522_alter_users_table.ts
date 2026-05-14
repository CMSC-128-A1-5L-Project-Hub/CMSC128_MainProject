import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.raw(`
      ALTER TABLE users 
      MODIFY account_status ENUM('pending', 'active', 'suspended', 'rejected') NULL
    `)
  }

  async down() {
    this.schema.raw(`
      ALTER TABLE users 
      MODIFY account_status ENUM('pending', 'active', 'suspended') NULL
    `)
  }
}