import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fees'

  async up() {
    this.schema.raw(
      `ALTER TABLE ${this.tableName} MODIFY fee_status ENUM('paid','unpaid','overdue','partial','pending') NOT NULL`
    )
  }

  async down() {
    this.schema.raw(
      `UPDATE ${this.tableName} SET fee_status = 'unpaid' WHERE fee_status = 'pending'`
    )
    this.schema.raw(
      `ALTER TABLE ${this.tableName} MODIFY fee_status ENUM('paid','unpaid','overdue','partial') NOT NULL`
    )
  }
}
