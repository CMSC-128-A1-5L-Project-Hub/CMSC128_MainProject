import db from "@adonisjs/lucid/services/db";
import User from "#models/user";
import FileMetadata from "#models/file_metadatum";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { UPLB_DORMS, makeBusinessPermit } from "#database/seed_data/uplb_dorms_data";
import { PRIVATE_DORMS } from "#database/seed_data/private_dorms_data";
import { uploadImageFromLocalPath } from "#services/b2_services";
import DistanceService from "#services/distance";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Landlords } from "#database/seed_data/users";

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = join(__dirname, '..', 'seed_data', 'images')
const ALL_DORMS = [...UPLB_DORMS, ...PRIVATE_DORMS]

export default class DormSeeder extends BaseSeeder {
  async run() {
    const landlords = await Promise.all(
      Landlords.map((l) => User.findByOrFail('email', l.email))
    )

    for (const [index, dorm] of ALL_DORMS.entries()) {
      //split dorms evenly among landlords
      const landlord = landlords[index % landlords.length]

      const existing = await db
        .from('accommodations')
        .where('accommodation_name', dorm.accommodation_name)
        .first()

      /*
        Modify this if instead of skipping, data is altered/updated

        Now resets occupancy to 0, comment out to change
      */
      if (existing) {
        console.log(`[skipped] "${dorm.accommodation_name}" already exists`)
        await db.from('rooms')
          .where('accommodation_id', existing.id)
          .update({ room_current_occupancy: 0 })
        continue
      }

      // make fake business permit
      const permitData = makeBusinessPermit(dorm.accommodation_name)
      const permit = await FileMetadata.firstOrCreate(
        { fileName: permitData.fileName },
        { ...permitData }
      )

      // compute walk/bike/drive minutes from coords when not pre-supplied
      let walking = dorm.walking_distance ?? null
      let biking = dorm.biking_distance ?? null
      let driving = dorm.driving_distance ?? null

      if (
        dorm.latitude != null &&
        dorm.longitude != null &&
        (walking == null || biking == null || driving == null)
      ) {
        try {
          const { walkingMinutes, drivingMinutes, cyclingMinutes } =
            await DistanceService.calculate(Number(dorm.latitude), Number(dorm.longitude))
          walking = walking ?? walkingMinutes
          biking = biking ?? cyclingMinutes
          driving = driving ?? drivingMinutes
        } catch (err) {
          console.warn(`[distance] failed for "${dorm.accommodation_name}":`, err)
        }
      }

      // insert accommodation to db
      const [accomId] = await db.table('accommodations').insert({
        landlord_id: landlord.id,
        business_permit_id: permit.id,
        accommodation_name: dorm.accommodation_name,
        accommodation_location: dorm.accommodation_location,
        accommodation_type: dorm.accommodation_type,
        accommodation_capacity: dorm.accommodation_capacity,
        accommodation_size: dorm.accommodation_size ?? null,
        tenant_restriction: dorm.tenant_restriction,
        latitude: dorm.latitude,
        longitude: dorm.longitude,
        walking_distance: walking,
        biking_distance: biking,
        driving_distance: driving,
        application_start_date: dorm.application_start_date ?? null,
        application_end_date: dorm.application_end_date ?? null,
        status: 'verified',
        primary_image_index: 0
      })

      // insert dorm tags to db (if applicable)
      if (dorm.tags?.length) {
        await db
          .table('accommodation_tags')
          .multiInsert(
            dorm.tags.map((tag) => ({
              accommodation_id: accomId,
              tag_detail: tag
            }))
          )
      }

      // insert dorm images to db
      for (const fileName of dorm.images) {
        let imageFile = await FileMetadata.findBy('fileName', fileName)

        if (!imageFile) {
          const localPath = join(IMAGES_DIR, fileName)
          const b2Url = await uploadImageFromLocalPath(localPath, fileName, 'accommodations/seed')
          imageFile = await FileMetadata.create({
            fileName,
            filePath: b2Url,
            fileType: 'image'
          })
        }

        await db.table('accommodation_images').insert({
          accommodation_id: accomId,
          image_file_id: imageFile.id
        })
      }

      // insert dorm rooms
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
          reservation_fee_value: room.reservation_fee_value ?? null
        })

        const roomTags = [
          ...(room.inclusions ?? []).map(
            (tag) => ({
              room_id: roomId,
              tag_detail: tag,
              type: 'inclusion'
            })
          ),
          ...(room.preferences ?? []).map(
            (tag) => ({
              room_id: roomId,
              tag_detail: tag,
              type: 'preference'
            })
          )
        ]

        // insert room tags
        if (roomTags.length) {
          await db.table('room_tags').multiInsert(roomTags)
        }
      }

      console.log(`[seeded] "${dorm.accommodation_name}" -> ${landlord.email}`)
    }
  }
}