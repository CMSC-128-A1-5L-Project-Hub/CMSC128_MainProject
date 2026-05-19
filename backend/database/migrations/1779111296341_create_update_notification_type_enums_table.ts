// database/migrations/xxxx_update_notification_type_enum.ts

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // For MySQL - modify the enum column
    await this.db.rawQuery(`
      ALTER TABLE notifications 
      MODIFY COLUMN notification_type ENUM(
        'fee_due', 
        'application_status', 
        'system', 
        'other',
        'move_out_request',
        'move_out_request_response'
      ) NOT NULL
    `)
  }

  async down() {
    await this.db.rawQuery(`
      ALTER TABLE notifications 
      MODIFY COLUMN notification_type ENUM(
        'fee_due', 
        'application_status', 
        'system', 
        'other'
      ) NOT NULL
    `)
  }
}