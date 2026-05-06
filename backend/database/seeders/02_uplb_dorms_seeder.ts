import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import FileMetadata from '#models/file_metadatum'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UPLB_DORMS } from '../seed_data/uplb_dorms_data.js'
import { uploadImageFromLocalPath } from '#services/b2_services'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = join(__dirname, '..', 'seed_data', 'images')

export default class UplbDormsSeeder extends BaseSeeder {
  async run() {
    // Reuse the UBLE landlord seeded by 01_uble_landlord_seeder.ts.
    const landlordUser = await User.findByOrFail('email', 'uble.ics.uplb@gmail.com')

    for (const dorm of UPLB_DORMS) {
      // Idempotency guard — accommodation_name has a UNIQUE constraint so this
      // also serves as the natural DB-level fence on re-runs.
      const existing = await db
        .from('accommodations')
        .where('accommodation_name', dorm.accommodation_name)
        .first()

      if (existing) {
        console.log(`[skip] "${dorm.accommodation_name}" already exists`)
        continue
      }

      // One business permit row per accommodation (business_permit_id is UNIQUE).
      // Keyed on a stable slug-based filename so re-runs are safe.
      const slug = dorm.accommodation_name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
      const permit = await FileMetadata.firstOrCreate(
        { fileName: `bp_seed_${slug}.pdf` },
        {
          fileName: `bp_seed_${slug}.pdf`,
          filePath: '/uploads/documents/placeholder_business_permit.pdf',
          fileType: 'document',
        }
      )

      // Insert the accommodation row.
      // NOTE: db.table().insert() returns [insertId, affectedRows] on MySQL.
      // If this project migrates to PostgreSQL, switch to .returning('id').
      const [accomId] = await db.table('accommodations').insert({
        landlord_id: landlordUser.id,
        business_permit_id: permit.id,
        accommodation_name: dorm.accommodation_name,
        accommodation_location: dorm.accommodation_location,
        accommodation_type: dorm.accommodation_type,
        accommodation_capacity: dorm.accommodation_capacity,
        accommodation_size: dorm.accommodation_size ?? null,
        tenant_restriction: dorm.tenant_restriction,
        latitude: dorm.latitude,
        longitude: dorm.longitude,
        walking_distance: dorm.walking_distance ?? null,
        biking_distance: dorm.biking_distance ?? null,
        driving_distance: dorm.driving_distance ?? null,
        application_start_date: dorm.application_start_date ?? null,
        application_end_date: dorm.application_end_date ?? null,
        status: 'verified',
        primary_image_index: 0,
      })

      // Accommodation-level tags
      if (dorm.tags?.length) {
        await db
          .table('accommodation_tags')
          .multiInsert(dorm.tags.map((tag) => ({ accommodation_id: accomId, tag_detail: tag })))
      }

      // Images — only upload to B2 if no file_metadata record exists yet for that filename.
      // Files must exist in database/seed_data/images/.
      for (const fileName of dorm.images) {
        let imageFile = await FileMetadata.findBy('fileName', fileName)
        if (!imageFile) {
          const localPath = join(IMAGES_DIR, fileName)
          const b2Url = await uploadImageFromLocalPath(localPath, fileName, 'accommodations/seed')
          imageFile = await FileMetadata.create({ fileName, filePath: b2Url, fileType: 'image' })
        }
        await db.table('accommodation_images').insert({
          accommodation_id: accomId,
          image_file_id: imageFile.id,
        })
      }

      // Rooms and their tags
      for (const room of dorm.rooms) {
        const [roomId] = await db.table('rooms').insert({
          accommodation_id: accomId,
          room_number: room.room_number,
          room_building: room.room_building,
          room_type: room.room_type,
          room_stay_type: room.room_stay_type,
          room_capacity: room.room_capacity,
          room_current_occupancy: room.room_current_occupancy,
          room_availability: room.room_availability,
          room_rent: room.room_rent,
          tenant_restriction: room.tenant_restriction,
          room_size: room.room_size ?? null,
          advance_months: room.advance_months ?? null,
          deposit_months: room.deposit_months ?? null,
          reservation_fee_type: room.reservation_fee_type ?? null,
          reservation_fee_value: room.reservation_fee_value ?? null,
        })

        const roomTags = [
          ...(room.inclusions ?? []).map((tag) => ({
            room_id: roomId,
            tag_detail: tag,
            type: 'inclusion',
          })),
          ...(room.preferences ?? []).map((tag) => ({
            room_id: roomId,
            tag_detail: tag,
            type: 'preference',
          })),
        ]
        if (roomTags.length) {
          await db.table('room_tags').multiInsert(roomTags)
        }
      }

      console.log(`[seeded] "${dorm.accommodation_name}"`)
    }
  }
}
