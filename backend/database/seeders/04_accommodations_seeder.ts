import db from '@adonisjs/lucid/services/db'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

async function isTableEmpty(table: string): Promise<boolean> {
  const result = await db.from(table).count('* as c')
  return Number(result[0].c) === 0
}

export default class AccommodationsSeeder extends BaseSeeder {
  async run() {
    const allFiles = await db.from('file_metadata').select('id', 'file_name')
    const getFile = (name: string) => allFiles.find((f) => f.file_name === name)?.id
    const allUsers = await db.from('users').select('id', 'email')
    const getUser = (email: string) => allUsers.find((u) => u.email === email)?.id

    // ── ACCOMMODATIONS (keyed on accommodation_name) ───────────────────────
    const accomRows = [
      { landlord_id: getUser('larkinsanchez@gmail.com'), manager_id: getUser('juan.delacruz@gmail.com'), business_permit_id: getFile('business_permit_1.pdf'), accommodation_name: 'White House', accommodation_location: 'Ruby St., Brgy. Batong Malake, Los Baños, Laguna', accommodation_type: 'off-campus', accommodation_capacity: 60, tenant_restriction: 'coed', status: 'verified', application_start_date: '2026-04-01', application_end_date: '2026-05-15', latitude: 14.1665, longitude: 121.2430, walking_distance: 10, biking_distance: 5, driving_distance: 3 },
      { landlord_id: getUser('cmnavarro@gmail.com'), manager_id: getUser('slmanuel@up.edu.ph'), business_permit_id: getFile('business_permit_2.pdf'), accommodation_name: 'One Silangan', accommodation_location: 'UPLB, Los Baños, Laguna', accommodation_type: 'on-campus', accommodation_capacity: 40, tenant_restriction: 'coed', status: 'verified', application_start_date: '2026-04-01', application_end_date: '2026-05-20', latitude: 14.1649, longitude: 121.2398, walking_distance: 5, biking_distance: 2, driving_distance: 2 },
      { landlord_id: getUser('pagarcia@up.edu.ph'), manager_id: getUser('mabautista@gmail.com'), business_permit_id: getFile('business_permit_3.pdf'), accommodation_name: "Men's Dorm", accommodation_location: 'UPLB, Los Baños, Laguna', accommodation_type: 'partner_housing', accommodation_capacity: 150, tenant_restriction: 'male-only', status: 'verified', application_start_date: '2026-03-20', application_end_date: '2026-04-30', latitude: 14.1638, longitude: 121.2410, walking_distance: 3, biking_distance: 2, driving_distance: 2 },
      { landlord_id: getUser('raortega@gmail.com'), manager_id: getUser('ampineda@up.edu.ph'), business_permit_id: getFile('business_permit_4.pdf'), accommodation_name: 'ATI', accommodation_location: 'UPLB, Los Baños, Laguna', accommodation_type: 'partner_housing', accommodation_capacity: 120, tenant_restriction: 'male-only', status: 'verified', application_start_date: '2026-04-05', application_end_date: '2026-05-25', latitude: 14.1643, longitude: 121.2405, walking_distance: 4, biking_distance: 2, driving_distance: 2 },
      { landlord_id: getUser('larkinsanchez@gmail.com'), manager_id: getUser('vepadilla@gmail.com'), business_permit_id: getFile('business_permit_5.pdf'), accommodation_name: "Scholar's Dorm", accommodation_location: 'UPLB, Los Baños, Laguna', accommodation_type: 'on-campus', accommodation_capacity: 50, tenant_restriction: 'female-only', status: 'verified', application_start_date: '2026-03-25', application_end_date: '2026-05-10', latitude: 14.1655, longitude: 121.2395, walking_distance: 5, biking_distance: 2, driving_distance: 2 },
      { landlord_id: getUser('ntramos@gmail.com'), manager_id: getUser('aralvarez@gmail.com'), business_permit_id: getFile('business_permit_6.pdf'), accommodation_name: 'One Sapphire Place', accommodation_location: 'Sapphire St., Brgy. Batong Malake, Los Baños, Laguna', accommodation_type: 'off-campus', accommodation_capacity: 50, tenant_restriction: 'coed', status: 'verified', application_start_date: '2026-03-25', application_end_date: '2026-05-10', latitude: 14.1672, longitude: 121.2435, walking_distance: 12, biking_distance: 6, driving_distance: 4 },
    ]
    const existingAccomNames = new Set(
      (await db.from('accommodations').select('accommodation_name')).map(
        (r: any) => r.accommodation_name
      )
    )
    const accomToInsert = accomRows.filter((a) => !existingAccomNames.has(a.accommodation_name))
    if (accomToInsert.length) await db.table('accommodations').multiInsert(accomToInsert)

    const allAccoms = await db.from('accommodations').select('id', 'accommodation_name')
    const getAccom = (name: string) => allAccoms.find((a) => a.accommodation_name === name)?.id

    // ── ACCOMMODATION TAGS (table-empty guard) ─────────────────────────────
    if (await isTableEmpty('accommodation_tags')) {
      await db.table('accommodation_tags').multiInsert([
        { accommodation_id: getAccom('White House'), tag_detail: 'Near campus' },
        { accommodation_id: getAccom('White House'), tag_detail: 'Pet friendly' },
        { accommodation_id: getAccom('One Silangan'), tag_detail: 'Near Establishments' },
        { accommodation_id: getAccom('One Silangan'), tag_detail: 'Air-conditioned rooms' },
        { accommodation_id: getAccom("Men's Dorm"), tag_detail: 'Has study area' },
        { accommodation_id: getAccom("Men's Dorm"), tag_detail: '24/7 Security' },
        { accommodation_id: getAccom('ATI'), tag_detail: 'Has study area' },
        { accommodation_id: getAccom('ATI'), tag_detail: '24/7 Security' },
        { accommodation_id: getAccom("Scholar's Dorm"), tag_detail: 'Has curfew' },
        { accommodation_id: getAccom("Scholar's Dorm"), tag_detail: 'Has canteen' },
        { accommodation_id: getAccom('One Sapphire Place'), tag_detail: 'Near campus' },
        { accommodation_id: getAccom('One Sapphire Place'), tag_detail: 'Air-conditioned rooms' },
      ])
    }

    // ── ACCOMMODATION IMAGES (image_file_id is UNIQUE) ─────────────────────
    const imageRows = [
      { accommodation_id: getAccom('White House'), image_file_id: getFile('accom1_img1.jpg') },
      { accommodation_id: getAccom('White House'), image_file_id: getFile('accom1_img2.jpg') },
      { accommodation_id: getAccom('One Silangan'), image_file_id: getFile('accom2_img1.jpg') },
      { accommodation_id: getAccom('One Silangan'), image_file_id: getFile('accom2_img2.jpg') },
      { accommodation_id: getAccom("Men's Dorm"), image_file_id: getFile('accom3_img1.jpg') },
      { accommodation_id: getAccom("Men's Dorm"), image_file_id: getFile('accom3_img2.jpg') },
      { accommodation_id: getAccom('ATI'), image_file_id: getFile('accom4_img1.jpg') },
      { accommodation_id: getAccom("Scholar's Dorm"), image_file_id: getFile('accom5_img1.jpg') },
      { accommodation_id: getAccom("Scholar's Dorm"), image_file_id: getFile('accom5_img2.jpg') },
      { accommodation_id: getAccom('One Sapphire Place'), image_file_id: getFile('accom6_img1.jpg') },
      { accommodation_id: getAccom('One Sapphire Place'), image_file_id: getFile('accom6_img2.jpg') },
    ]
    const existingImageFileIds = new Set(
      (await db.from('accommodation_images').select('image_file_id')).map(
        (r: any) => r.image_file_id
      )
    )
    const imagesToInsert = imageRows.filter((r) => !existingImageFileIds.has(r.image_file_id))
    if (imagesToInsert.length) await db.table('accommodation_images').multiInsert(imagesToInsert)

    // ── REVIEWS (table-empty guard) ────────────────────────────────────────
    if (await isTableEmpty('reviews')) {
      await db.table('reviews').multiInsert([
        { accommodation_id: getAccom('White House'), student_number: '2023-123456', rating: 4, content: 'Clean rooms, responsive landlord, and very close to the university.', created_at: '2026-03-10 09:15:00' },
        { accommodation_id: getAccom('White House'), student_number: '2023-123456', rating: 3, content: 'Decent but the room is small.', created_at: '2026-03-12 14:20:00' },
        { accommodation_id: getAccom('One Silangan'), student_number: '2023-123456', rating: 5, content: null, created_at: '2026-03-15 10:00:00' },
        { accommodation_id: getAccom('One Silangan'), student_number: '2023-123456', rating: 5, content: 'Clean rooms, responsive landlord, and very close to the university.', created_at: '2026-03-16 16:45:00' },
        { accommodation_id: getAccom("Men's Dorm"), student_number: '2023-123456', rating: 1, content: 'Maintenance needs improvement.', created_at: '2026-03-18 11:30:00' },
        { accommodation_id: getAccom("Men's Dorm"), student_number: '2023-123456', rating: 4, content: 'Nice location, but the internet is sometimes slow.', created_at: '2026-03-19 13:10:00' },
        { accommodation_id: getAccom('ATI'), student_number: '2023-123456', rating: 2, content: 'Noisy environment and needs better lighting.', created_at: '2026-03-21 08:55:00' },
        { accommodation_id: getAccom('ATI'), student_number: '2023-123456', rating: 4, content: 'Spacious room but shared bathroom can be crowded.', created_at: '2026-03-22 17:25:00' },
        { accommodation_id: getAccom("Scholar's Dorm"), student_number: '2023-123456', rating: 3, content: 'Affordable, but cleaning service is irregular.', created_at: '2026-03-24 09:40:00' },
        { accommodation_id: getAccom("Scholar's Dorm"), student_number: '2023-123456', rating: 2, content: 'Walls are thin, noise from neighbors is noticeable.', created_at: '2026-03-25 15:05:00' },
        { accommodation_id: getAccom('One Sapphire Place'), student_number: '2023-123456', rating: 5, content: 'Excellent accommodation, would highly recommend!', created_at: '2026-03-27 12:00:00' },
        { accommodation_id: getAccom('One Sapphire Place'), student_number: '2023-123456', rating: 3, content: 'Average stay, nothing special but decent overall.', created_at: '2026-03-28 18:30:00' },
      ])
    }

    // ── ROOMS (composite key: accommodation_id + room_number) ──────────────
    const roomRows = [
      { accommodation_id: getAccom('White House'), room_number: '101', room_type: 'single', room_stay_type: 'transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Building A', room_rent: 5000.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 18.5, advance_months: 1, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 1000.0 },
      { accommodation_id: getAccom('White House'), room_number: '102', room_type: 'double', room_stay_type: 'transient', room_capacity: 2, room_current_occupancy: 1, room_building: 'Building A', room_rent: 6500.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 24.0, advance_months: 1, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 1500.0 },
      { accommodation_id: getAccom('White House'), room_number: '103', room_type: 'single', room_stay_type: 'non_transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Building A', room_rent: 5200.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 14.5, advance_months: 1, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 1000.0 },
      { accommodation_id: getAccom('White House'), room_number: '104', room_type: 'double', room_stay_type: 'non_transient', room_capacity: 2, room_current_occupancy: 0, room_building: 'Building A', room_rent: 7000.0, tenant_restriction: 'coed', room_availability: 'available' },
      { accommodation_id: getAccom('White House'), room_number: '105', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 3, room_current_occupancy: 1, room_building: 'Building A', room_rent: 4900.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 28.0, advance_months: 1, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 1000.0 },
      { accommodation_id: getAccom('White House'), room_number: '106', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 3, room_current_occupancy: 2, room_building: 'Building A', room_rent: 4700.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 26.5, advance_months: 1, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 1000.0 },
      { accommodation_id: getAccom('White House'), room_number: '303', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 3, room_current_occupancy: 1, room_building: 'Building A', room_rent: 4800.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 27.5, advance_months: 1, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 1000.0 },
      { accommodation_id: getAccom('One Silangan'), room_number: '201', room_type: 'single', room_stay_type: 'transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Building A', room_rent: 6000.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 20.0, advance_months: 1, deposit_months: 2, reservation_fee_type: 'percentage', reservation_fee_value: 20.0 },
      { accommodation_id: getAccom('One Silangan'), room_number: '202', room_type: 'double', room_stay_type: 'transient', room_capacity: 2, room_current_occupancy: 2, room_building: 'Building A', room_rent: 7000.0, tenant_restriction: 'coed', room_availability: 'occupied', room_size: 28.0, advance_months: 1, deposit_months: 2, reservation_fee_type: 'percentage', reservation_fee_value: 20.0 },
      { accommodation_id: getAccom('One Silangan'), room_number: '203', room_type: 'single', room_stay_type: 'non_transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Building B', room_rent: 6200.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 21.0, advance_months: 1, deposit_months: 2, reservation_fee_type: 'percentage', reservation_fee_value: 20.0 },
      { accommodation_id: getAccom('One Silangan'), room_number: '204', room_type: 'double', room_stay_type: 'non_transient', room_capacity: 2, room_current_occupancy: 0, room_building: 'Building B', room_rent: 6800.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 20.0, advance_months: 1, deposit_months: 1, reservation_fee_type: 'percentage', reservation_fee_value: 20.0 },
      { accommodation_id: getAccom("Men's Dorm"), room_number: '301', room_type: 'shared', room_stay_type: 'transient', room_capacity: 4, room_current_occupancy: 3, room_building: 'Building B', room_rent: 800.0, tenant_restriction: 'non-coed', room_availability: 'occupied', room_size: 32.0, advance_months: 1, deposit_months: 0, reservation_fee_type: 'fixed', reservation_fee_value: 500.0 },
      { accommodation_id: getAccom("Men's Dorm"), room_number: '302', room_type: 'shared', room_stay_type: 'transient', room_capacity: 4, room_current_occupancy: 1, room_building: 'Building C', room_rent: 800.0, tenant_restriction: 'non-coed', room_availability: 'available', room_size: 32.0, advance_months: 1, deposit_months: 0, reservation_fee_type: 'fixed', reservation_fee_value: 500.0 },
      { accommodation_id: getAccom("Men's Dorm"), room_number: '303', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 4, room_current_occupancy: 0, room_building: 'Building C', room_rent: 850.0, tenant_restriction: 'non-coed', room_availability: 'available', room_size: 28.0, advance_months: 0, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 500.0 },
      { accommodation_id: getAccom('ATI'), room_number: '401', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 4, room_current_occupancy: 4, room_building: 'Building A', room_rent: 800.0, tenant_restriction: 'non-coed', room_availability: 'occupied', room_size: 34.0, advance_months: 0, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 500.0 },
      { accommodation_id: getAccom('ATI'), room_number: '402', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 4, room_current_occupancy: 0, room_building: 'Building B', room_rent: 800.0, tenant_restriction: 'non-coed', room_availability: 'available', room_size: 34.0, advance_months: 0, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 500.0 },
      { accommodation_id: getAccom('ATI'), room_number: '403', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 4, room_current_occupancy: 1, room_building: 'Building B', room_rent: 850.0, tenant_restriction: 'non-coed', room_availability: 'available', room_size: 30.0, advance_months: 0, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 500.0 },
      { accommodation_id: getAccom("Scholar's Dorm"), room_number: '501', room_type: 'single', room_stay_type: 'non_transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Building C', room_rent: 5500.0, tenant_restriction: 'coed', room_availability: 'maintenance', room_size: 19.0, advance_months: 1, deposit_months: 1, reservation_fee_type: 'percentage', reservation_fee_value: 25.0 },
      { accommodation_id: getAccom("Scholar's Dorm"), room_number: '502', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 3, room_current_occupancy: 2, room_building: 'Building C', room_rent: 6000.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 30.0, advance_months: 1, deposit_months: 1, reservation_fee_type: 'percentage', reservation_fee_value: 25.0 },
      { accommodation_id: getAccom("Scholar's Dorm"), room_number: '503', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 3, room_current_occupancy: 0, room_building: 'Building C', room_rent: 5800.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 24.0, advance_months: 1, deposit_months: 1, reservation_fee_type: 'percentage', reservation_fee_value: 15.0 },
      { accommodation_id: getAccom('One Sapphire Place'), room_number: '601', room_type: 'single', room_stay_type: 'transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 4500.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 18.0, advance_months: 1, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 1000.0 },
      { accommodation_id: getAccom('One Sapphire Place'), room_number: '602', room_type: 'double', room_stay_type: 'non_transient', room_capacity: 2, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 3200.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 25.0, advance_months: 1, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 800.0 },
      { accommodation_id: getAccom('One Sapphire Place'), room_number: '603', room_type: 'double', room_stay_type: 'transient', room_capacity: 2, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 3800.0, tenant_restriction: 'coed', room_availability: 'available', room_size: 19.5, advance_months: 1, deposit_months: 1, reservation_fee_type: 'fixed', reservation_fee_value: 800.0 },
    ]
    const existingRoomKeys = new Set(
      (await db.from('rooms').select('accommodation_id', 'room_number')).map(
        (r: any) => `${r.accommodation_id}::${r.room_number}`
      )
    )
    const roomsToInsert = roomRows.filter(
      (r) => !existingRoomKeys.has(`${r.accommodation_id}::${r.room_number}`)
    )
    if (roomsToInsert.length) await db.table('rooms').multiInsert(roomsToInsert)

    const allRooms = await db.from('rooms').select('id', 'room_number', 'accommodation_id')
    const getRoom = (roomNum: string, accomName: string) =>
      allRooms.find(
        (r) => r.room_number === roomNum && r.accommodation_id === getAccom(accomName)
      )?.id

    // ── ROOM TAGS (table-empty guard, scoped to non-UBLE rooms) ────────────
    // Skip if any room_tags exist for the accommodations seeded here.
    const seededAccomIds = [
      getAccom('White House'),
      getAccom('One Silangan'),
      getAccom("Men's Dorm"),
      getAccom('ATI'),
      getAccom("Scholar's Dorm"),
      getAccom('One Sapphire Place'),
    ].filter(Boolean) as number[]
    const tagCount = await db
      .from('room_tags')
      .join('rooms', 'rooms.id', 'room_tags.room_id')
      .whereIn('rooms.accommodation_id', seededAccomIds)
      .count('* as c')
    if (Number(tagCount[0].c) === 0) {
      await db.table('room_tags').multiInsert([
        { room_id: getRoom('101', 'White House'), tag_detail: 'Private bathroom', type: 'inclusion' },
        { room_id: getRoom('101', 'White House'), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('101', 'White House'), tag_detail: 'Ground floor', type: 'preference' },
        { room_id: getRoom('102', 'White House'), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('102', 'White House'), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('102', 'White House'), tag_detail: 'Has wardrobe', type: 'inclusion' },
        { room_id: getRoom('103', 'White House'), tag_detail: 'Private bathroom', type: 'inclusion' },
        { room_id: getRoom('103', 'White House'), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('103', 'White House'), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('103', 'White House'), tag_detail: 'Furnished', type: 'preference' },
        { room_id: getRoom('103', 'White House'), tag_detail: 'Near Entrance', type: 'preference' },
        { room_id: getRoom('104', 'White House'), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('104', 'White House'), tag_detail: 'Has wardrobe', type: 'inclusion' },
        { room_id: getRoom('104', 'White House'), tag_detail: 'Air-conditioned', type: 'preference' },
        { room_id: getRoom('104', 'White House'), tag_detail: 'Furnished', type: 'preference' },
        { room_id: getRoom('105', 'White House'), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('105', 'White House'), tag_detail: 'Has wardrobe', type: 'inclusion' },
        { room_id: getRoom('105', 'White House'), tag_detail: 'Near comfort room', type: 'preference' },
        { room_id: getRoom('105', 'White House'), tag_detail: 'Near Entrance', type: 'preference' },
        { room_id: getRoom('106', 'White House'), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('106', 'White House'), tag_detail: 'Has wardrobe', type: 'inclusion' },
        { room_id: getRoom('106', 'White House'), tag_detail: 'Ground floor', type: 'preference' },
        { room_id: getRoom('106', 'White House'), tag_detail: 'Near Entrance', type: 'preference' },
        { room_id: getRoom('303', 'White House'), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('303', 'White House'), tag_detail: 'Has wardrobe', type: 'inclusion' },
        { room_id: getRoom('201', 'One Silangan'), tag_detail: 'Private bathroom', type: 'inclusion' },
        { room_id: getRoom('201', 'One Silangan'), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('201', 'One Silangan'), tag_detail: 'Has ref', type: 'inclusion' },
        { room_id: getRoom('202', 'One Silangan'), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('202', 'One Silangan'), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('202', 'One Silangan'), tag_detail: 'Near elevator', type: 'preference' },
        { room_id: getRoom('203', 'One Silangan'), tag_detail: 'Private bathroom', type: 'inclusion' },
        { room_id: getRoom('203', 'One Silangan'), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('203', 'One Silangan'), tag_detail: 'Has balcony', type: 'preference' },
        { room_id: getRoom('204', 'One Silangan'), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('204', 'One Silangan'), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('204', 'One Silangan'), tag_detail: 'Has wardrobe', type: 'inclusion' },
        { room_id: getRoom('204', 'One Silangan'), tag_detail: 'Near Entrance', type: 'preference' },
        { room_id: getRoom('204', 'One Silangan'), tag_detail: 'Has balcony', type: 'preference' },
        { room_id: getRoom('301', "Men's Dorm"), tag_detail: 'Shared bathroom', type: 'inclusion' },
        { room_id: getRoom('301', "Men's Dorm"), tag_detail: 'Has study area', type: 'inclusion' },
        { room_id: getRoom('301', "Men's Dorm"), tag_detail: 'Has locker', type: 'inclusion' },
        { room_id: getRoom('302', "Men's Dorm"), tag_detail: 'Shared bathroom', type: 'inclusion' },
        { room_id: getRoom('302', "Men's Dorm"), tag_detail: 'Has locker', type: 'inclusion' },
        { room_id: getRoom('302', "Men's Dorm"), tag_detail: 'Ground floor', type: 'preference' },
        { room_id: getRoom('303', "Men's Dorm"), tag_detail: 'Shared bathroom', type: 'inclusion' },
        { room_id: getRoom('303', "Men's Dorm"), tag_detail: 'Has study area', type: 'inclusion' },
        { room_id: getRoom('303', "Men's Dorm"), tag_detail: 'Has locker', type: 'inclusion' },
        { room_id: getRoom('303', "Men's Dorm"), tag_detail: 'Near Fire Exit', type: 'preference' },
        { room_id: getRoom('303', "Men's Dorm"), tag_detail: 'Top Floor', type: 'preference' },
        { room_id: getRoom('401', 'ATI'), tag_detail: 'Shared bathroom', type: 'inclusion' },
        { room_id: getRoom('401', 'ATI'), tag_detail: 'Has study area', type: 'inclusion' },
        { room_id: getRoom('401', 'ATI'), tag_detail: 'Has locker', type: 'inclusion' },
        { room_id: getRoom('402', 'ATI'), tag_detail: 'Shared bathroom', type: 'inclusion' },
        { room_id: getRoom('402', 'ATI'), tag_detail: 'Has study area', type: 'inclusion' },
        { room_id: getRoom('402', 'ATI'), tag_detail: 'Near comfort room', type: 'preference' },
        { room_id: getRoom('403', 'ATI'), tag_detail: 'Shared bathroom', type: 'inclusion' },
        { room_id: getRoom('403', 'ATI'), tag_detail: 'Has study area', type: 'inclusion' },
        { room_id: getRoom('403', 'ATI'), tag_detail: 'Near comfort room', type: 'inclusion' },
        { room_id: getRoom('403', 'ATI'), tag_detail: 'Near Fire Exit', type: 'preference' },
        { room_id: getRoom('403', 'ATI'), tag_detail: 'Near Lobby', type: 'preference' },
        { room_id: getRoom('501', "Scholar's Dorm"), tag_detail: 'Private bathroom', type: 'inclusion' },
        { room_id: getRoom('501', "Scholar's Dorm"), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('501', "Scholar's Dorm"), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('502', "Scholar's Dorm"), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('502', "Scholar's Dorm"), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('502', "Scholar's Dorm"), tag_detail: 'Has wardrobe', type: 'inclusion' },
        { room_id: getRoom('503', "Scholar's Dorm"), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('503', "Scholar's Dorm"), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('503', "Scholar's Dorm"), tag_detail: 'Has wardrobe', type: 'inclusion' },
        { room_id: getRoom('503', "Scholar's Dorm"), tag_detail: 'Ground Floor', type: 'preference' },
        { room_id: getRoom('503', "Scholar's Dorm"), tag_detail: 'Furnished', type: 'preference' },
        { room_id: getRoom('601', 'One Sapphire Place'), tag_detail: 'Private bathroom', type: 'inclusion' },
        { room_id: getRoom('601', 'One Sapphire Place'), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('601', 'One Sapphire Place'), tag_detail: 'Has ref', type: 'inclusion' },
        { room_id: getRoom('602', 'One Sapphire Place'), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('602', 'One Sapphire Place'), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('602', 'One Sapphire Place'), tag_detail: 'Has wardrobe', type: 'inclusion' },
        { room_id: getRoom('603', 'One Sapphire Place'), tag_detail: 'Air-conditioned', type: 'inclusion' },
        { room_id: getRoom('603', 'One Sapphire Place'), tag_detail: 'Has study desk', type: 'inclusion' },
        { room_id: getRoom('603', 'One Sapphire Place'), tag_detail: 'Has wardrobe', type: 'inclusion' },
        { room_id: getRoom('603', 'One Sapphire Place'), tag_detail: 'Near Lobby', type: 'preference' },
        { room_id: getRoom('603', 'One Sapphire Place'), tag_detail: 'Near Entrance', type: 'preference' },
      ])
    }
  }
}
