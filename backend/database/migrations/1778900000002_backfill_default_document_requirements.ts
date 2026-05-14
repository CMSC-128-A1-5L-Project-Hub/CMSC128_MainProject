import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Backfill: every existing accommodation that has zero document requirements
    // gets a default "Valid ID" entry. Idempotent — safe to re-run logically
    // (won't double-insert because new accommodations created post-migration
    // already get this row from accommodation_controller.store).
    await this.db.rawQuery(`
      INSERT INTO accommodation_document_requirements
        (accommodation_id, requirement_name, accepted_format, created_at, updated_at)
      SELECT a.id, 'Valid ID', 'any', NOW(), NOW()
      FROM accommodations a
      LEFT JOIN accommodation_document_requirements r ON r.accommodation_id = a.id
      WHERE r.id IS NULL
    `)
  }

  async down() {
    // Remove backfilled defaults. We only undo rows that exactly match the
    // default — landlord-created/edited rows are preserved.
    await this.db.rawQuery(`
      DELETE FROM accommodation_document_requirements
      WHERE requirement_name = 'Valid ID' AND accepted_format = 'any'
    `)
  }
}
