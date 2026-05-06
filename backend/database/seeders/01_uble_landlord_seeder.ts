import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Landlord from '#models/landlord'
import FileMetadata from '#models/file_metadatum'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class UbleLandlordSeeder extends BaseSeeder {
  async run() {
    const businessPermit = await FileMetadata.firstOrCreate(
      { fileName: 'business_permit_uble.pdf' },
      {
        fileName: 'business_permit_uble.pdf',
        filePath: '/uploads/documents/business_permit_uble.pdf',
        fileType: 'document',
      }
    )

    const landlordUser = await User.firstOrCreate(
      { email: 'uble.ics.uplb@gmail.com' },
      {
        fname: 'UBLE',
        lname: 'ICS UPLB',
        email: 'uble.ics.uplb@gmail.com',
        role: 'landlord',
      }
    )

    await Landlord.firstOrCreate(
      { userId: landlordUser.id },
      {
        userId: landlordUser.id,
        tin: '000-000-000-000',
      }
    )

    const managerUser = await User.firstOrCreate(
      { email: 'manager.uble.test@gmail.com' },
      {
        fname: 'Rosa',
        lname: 'Dela Cruz',
        email: 'manager.uble.test@gmail.com',
        role: 'manager',
      }
    )

    const existingPhone = await db
      .from('phone_numbers')
      .where('user_id', managerUser.id)
      .where('is_primary', true)
      .first()
    if (!existingPhone) {
      await db
        .table('phone_numbers')
        .insert({ user_id: managerUser.id, contact_number: '09191234567', is_primary: true })
    }

    const existingManager = await db.from('managers').where('user_id', managerUser.id).first()
    if (!existingManager) {
      await db.table('managers').insert({ user_id: managerUser.id, manager_status: 'active' })
    }

    const existingAccom = await db
      .from('accommodations')
      .where('accommodation_name', 'UBLE Residences')
      .first()
    if (!existingAccom) {
      await db.table('accommodations').insert({
        landlord_id: landlordUser.id,
        manager_id: managerUser.id,
        business_permit_id: businessPermit.id,
        accommodation_name: 'UBLE Residences',
        accommodation_location: 'University of the Philippines Los Baños, Laguna',
        accommodation_type: 'on-campus',
        accommodation_capacity: 12,
        tenant_restriction: 'coed',
        status: 'verified',
        application_start_date: '2026-04-01',
        application_end_date: '2026-05-15',
        latitude: 14.1651,
        longitude: 121.2402,
        walking_distance: 5,
        biking_distance: 2,
        driving_distance: 2,
      })
    }

    const accom = await db
      .from('accommodations')
      .where('accommodation_name', 'UBLE Residences')
      .firstOrFail()

    const existingRooms = await db
      .from('rooms')
      .where('accommodation_id', accom.id)
      .count('* as total')
    if (Number(existingRooms[0].total) === 0) {
      await db.table('rooms').multiInsert([
        // 101 → Sunrise Suite (Single, ₱6,500)
        { accommodation_id: accom.id, room_number: '101', room_type: 'single', room_stay_type: 'non_transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 6500.00, tenant_restriction: 'coed', room_availability: 'available' },
        // 102 → Garden View (Double, ₱8,000)
        { accommodation_id: accom.id, room_number: '102', room_type: 'double', room_stay_type: 'non_transient', room_capacity: 2, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 8000.00, tenant_restriction: 'coed', room_availability: 'available' },
        // 103 → Cozy Nook (Shared 4-bed, ₱3,500)
        { accommodation_id: accom.id, room_number: '103', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 4, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 3500.00, tenant_restriction: 'coed', room_availability: 'available' },
        // 104 → Penthouse (Single, ₱12,000)
        { accommodation_id: accom.id, room_number: '104', room_type: 'single', room_stay_type: 'non_transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 12000.00, tenant_restriction: 'coed', room_availability: 'available' },
        // 105 → Studio 5 (Shared 4-bed, ₱4,000)
        { accommodation_id: accom.id, room_number: '105', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 4, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 4000.00, tenant_restriction: 'coed', room_availability: 'available' },
      ])

      const rooms = await db
        .from('rooms')
        .where('accommodation_id', accom.id)
        .select('id', 'room_number')
      const getRoom = (num: string) => rooms.find((r) => r.room_number === num)?.id

      await db.table('room_tags').multiInsert([
        // 101 — Sunrise Suite
        { room_id: getRoom('101'), tag_detail: 'WiFi Ready' },
        { room_id: getRoom('101'), tag_detail: 'Furnished' },
        { room_id: getRoom('101'), tag_detail: 'Air-conditioned' },
        // 102 — Garden View
        { room_id: getRoom('102'), tag_detail: 'Furnished' },
        { room_id: getRoom('102'), tag_detail: 'Private bathroom' },
        { room_id: getRoom('102'), tag_detail: 'Has study desk' },
        { room_id: getRoom('102'), tag_detail: 'Garden view' },
        // 103 — Cozy Nook
        { room_id: getRoom('103'), tag_detail: 'Has study desk' },
        { room_id: getRoom('103'), tag_detail: 'Laundry access' },
        { room_id: getRoom('103'), tag_detail: 'Kitchen access' },
        // 104 — Penthouse
        { room_id: getRoom('104'), tag_detail: 'Has balcony' },
        { room_id: getRoom('104'), tag_detail: 'CCTV security' },
        { room_id: getRoom('104'), tag_detail: 'Keycard access' },
        { room_id: getRoom('104'), tag_detail: 'Parking' },
        { room_id: getRoom('104'), tag_detail: 'TV' },
        // 105 — Studio 5
        { room_id: getRoom('105'), tag_detail: 'WiFi Ready' },
        { room_id: getRoom('105'), tag_detail: 'Furnished' },
        { room_id: getRoom('105'), tag_detail: 'Air-conditioned' },
        { room_id: getRoom('105'), tag_detail: 'Meal plan' },
      ])
    }
  }
}
