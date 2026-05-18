import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fees'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('accommodation_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('accommodations')
        .onDelete('SET NULL')
    })

    // Backfill existing fees: pick the accommodation tied to the student's
    // most recent assignment (active or otherwise) — best-effort historical guess.
    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE fees f
        LEFT JOIN (
          SELECT a.student_number, r.accommodation_id
          FROM assignments a
          INNER JOIN rooms r ON r.id = a.room_id
          INNER JOIN (
            SELECT student_number, MAX(move_in) AS latest_move_in
            FROM assignments
            GROUP BY student_number
          ) latest
            ON latest.student_number = a.student_number
            AND latest.latest_move_in = a.move_in
        ) x ON x.student_number = f.student_number
        SET f.accommodation_id = x.accommodation_id
        WHERE f.accommodation_id IS NULL
      `)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['accommodation_id'])
      table.dropColumn('accommodation_id')
    })
  }
}
