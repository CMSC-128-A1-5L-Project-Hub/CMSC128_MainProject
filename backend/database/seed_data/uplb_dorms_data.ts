// ─── HOW TO ADD A NEW DORM ────────────────────────────────────────────────────
// 1. Coordinates  — Google Maps → right-click pin → copy lat/lng (6 decimal places)
// 2. Photos       — drop .jpg / .png / .webp files into database/seed_data/images/
//                   Filenames must be unique across ALL dorms (prefix with dorm slug,
//                   e.g. "kamia_hall_front.jpg"). The seeder uploads them to B2.
// 3. Add an entry to UPLB_DORMS below (TypeScript will catch missing required fields)
// 4. Run: cd backend && node ace db:seed --files database/seeders/02_uplb_dorms_seeder.ts
// 5. Verify the pin appears on /map
//
// To fix wrong data: delete the accommodation row in the DB, then re-run the seeder.
// Or reset everything: node ace migration:fresh --seed
//
// Taken names (do NOT reuse — unique constraint in DB):
//   "UBLE Residences", "White House", "One Silangan", "Men's Dorm",
//   "ATI", "Scholar's Dorm", "One Sapphire Place"
// ─────────────────────────────────────────────────────────────────────────────

export interface RoomSeedData {
  room_number: string                                    // max 5 chars
  room_building: string                                  // max 20 chars
  room_type: 'single' | 'double' | 'shared'
  room_stay_type: 'transient' | 'non_transient'
  room_capacity: number
  room_current_occupancy: number
  room_availability: 'available' | 'occupied' | 'maintenance'
  room_rent: number                                      // PHP per month
  tenant_restriction: 'coed' | 'non-coed'
  room_size?: number                                     // sqm
  advance_months?: number
  deposit_months?: number
  reservation_fee_type?: 'fixed' | 'percentage'
  reservation_fee_value?: number
  inclusions?: string[]                                  // room_tags type='inclusion', max 30 chars each
  preferences?: string[]                                 // room_tags type='preference', max 30 chars each
}

export interface DormSeedData {
  accommodation_name: string                             // IDEMPOTENCY KEY — max 50 chars
  accommodation_location: string                         // human-readable address, max 150 chars
  latitude: number                                       // decimal(9,6) from Google Maps
  longitude: number
  accommodation_type: 'on-campus' | 'off-campus' | 'partner_housing'
  tenant_restriction: 'male-only' | 'female-only' | 'coed'
  accommodation_capacity: number                         // total tenants
  accommodation_size?: number                            // sqm of whole property
  walking_distance?: number                              // minutes to UPLB gate
  biking_distance?: number
  driving_distance?: number
  application_start_date?: string                        // 'YYYY-MM-DD'
  application_end_date?: string
  // Filenames of images in database/seeders/data/images/ (e.g. 'kamia_hall_front.jpg').
  // First entry is the cover image. Filenames must be unique across ALL dorms.
  images: string[]
  tags?: string[]                                        // accommodation-level tags, max 30 chars each
  rooms: RoomSeedData[]
}

/*
    Based from OSH data -> room inclusions
*/
const OSH_BASIC = ["Study desk", "Cabinet", "Laundry Area"]
const OSH_BASIC_WIFI = ["Study desk", "Cabinet", "Laundry Area", "WiFi Ready"]



// Add real UPLB dorms here. Example shape:
// const kamia_residence_hall: DormSeedData = 
// {
//   accommodation_name: 'Kamia Residence Hall',      // max 50 chars
//   accommodation_location: 'Kamia Rd, UPLB Campus, College, Laguna',
//   latitude: 14.166012,
//   longitude: 121.241543,
//   accommodation_type: 'on-campus',
//   tenant_restriction: 'female-only',
//   accommodation_capacity: 200,
//   walking_distance: 5,
//   biking_distance: 2,
//   driving_distance: 3,
//   application_start_date: '2026-06-01',
//   application_end_date: '2026-07-15',
//   images: [
//     'kamia_hall_front.jpg',    // file must exist in data/images/
//     'kamia_hall_lobby.jpg',
//   ],
//   tags: ['On-campus housing', '24/7 Security', 'Has canteen'],
//   rooms: [
//     {
//       room_number: '101',
//       room_building: 'Kamia Hall',
//       room_type: 'shared',
//       room_stay_type: 'non_transient',
//       room_capacity: 4,
//       room_current_occupancy: 0,
//       room_availability: 'available',
//       room_rent: 1800,
//       tenant_restriction: 'non-coed',
//       inclusions: ['Study desk', 'Locker', 'WiFi Ready'],
//     },
//   ],
// },

//Follow this format
const makiling_residence_hall: DormSeedData = {
  accommodation_name: 'Makiling Residence Hall',      // max 50 chars
  accommodation_location: 'Felix O. Chinte, UPLB Campus, College, Laguna',
  latitude: 14.152173,
  longitude: 121.235081,
  accommodation_type: 'on-campus',
  tenant_restriction: 'female-only',
  accommodation_capacity: 200,
  walking_distance: 36,
  biking_distance: 15,
  driving_distance: 8,
  application_start_date: '2026-06-01',
  application_end_date: '2026-07-15',
  images: [
    'Makiling_Hall_entrance.jpg',    // file must exist in data/images/
    'Makiling_Hall_inside.jpg',
    'Makiling_Hall_inside2.jpg',
    'Makiling_Hall_main.jpg',
    'Makiling_Hall_side.jpg',
  ],
  tags: ['On-campus housing', '24/7 Security', 'Has canteen'],
  rooms: [
    {
      room_number: '101',
      room_building: 'Makiling Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      inclusions: ['Study desk', 'Cabinet', 'WiFi Ready'],
    },
    {
      room_number: '102',
      room_building: 'Makiling Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 3,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      inclusions: ['Study desk', 'Cabinet', 'WiFi Ready'],
    },
    {
      room_number: '103',
      room_building: 'Makiling Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 3,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      inclusions: ['Study desk', 'Cabinet', 'WiFi Ready'],
    },
    {
      room_number: '104',
      room_building: 'Makiling Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      inclusions: ['Study desk', 'Cabinet', 'WiFi Ready'],
    },
    {
      room_number: '105',
      room_building: 'Makiling Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 2,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      inclusions: ['Study desk', 'Cabinet', 'WiFi Ready'],
    },
    {
      room_number: '106',
      room_building: 'Makiling Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 5,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      inclusions: ['Study desk', 'Cabinet', 'WiFi Ready'],
    },
  ]
}

// const mens_residence_hall: DormSeedData = {
//   accommodation_name: "Men's Residence Hall",
//   accommodation_location:
//     'Lope K. Santos Ave., Lower Campus, UPLB, College, Los Baños, Laguna',
//   latitude: 14.166200,
//   longitude: 121.241800,
//   accommodation_type: 'on-campus',
//   tenant_restriction: 'male-only',
//   accommodation_capacity: 300,
//   walking_distance: 18,
//   biking_distance: 7,
//   driving_distance: 4,
//   application_start_date: '2026-06-01',
//   application_end_date: '2026-07-15',
//   images: [
//     'MRH_front.jpg',
//     'MRH_room.jpg',
//     'MRH_corridor.jpg',
//     'MRH_common.jpg',
//   ],
//   tags: [
//     'On-campus housing',
//     'UP-owned',
//     '24/7 Security',
//     'Laundry facilities',
//     'Canteen on-site',
//     'Subsidized rates',
//   ],
//   rooms: [
//     {
//       room_number: '101',
//       room_building: "Men's Hall",
//       room_type: 'shared',
//       room_stay_type: 'non_transient',
//       room_capacity: 4,
//       room_current_occupancy: 0,
//       room_availability: 'available',
//       room_rent: 800,
//       tenant_restriction: 'non-coed',
//       reservation_fee_type: 'fixed',
//       reservation_fee_value: 800,
//       inclusions: OSH_BASIC,
//       preferences: ['Ground floor'],
//     },
//     {
//       room_number: '102',
//       room_building: "Men's Hall",
//       room_type: 'shared',
//       room_stay_type: 'non_transient',
//       room_capacity: 4,
//       room_current_occupancy: 0,
//       room_availability: 'available',
//       room_rent: 800,
//       tenant_restriction: 'non-coed',
//       reservation_fee_type: 'fixed',
//       reservation_fee_value: 800,
//       inclusions: OSH_BASIC,
//     },
//     {
//       room_number: '201',
//       room_building: "Men's Hall",
//       room_type: 'shared',
//       room_stay_type: 'non_transient',
//       room_capacity: 4,
//       room_current_occupancy: 0,
//       room_availability: 'available',
//       room_rent: 800,
//       tenant_restriction: 'non-coed',
//       reservation_fee_type: 'fixed',
//       reservation_fee_value: 800,
//       inclusions: OSH_BASIC,
//     },
//     {
//       room_number: '202',
//       room_building: "Men's Hall",
//       room_type: 'shared',
//       room_stay_type: 'non_transient',
//       room_capacity: 4,
//       room_current_occupancy: 0,
//       room_availability: 'available',
//       room_rent: 800,
//       tenant_restriction: 'non-coed',
//       reservation_fee_type: 'fixed',
//       reservation_fee_value: 800,
//       inclusions: OSH_BASIC,
//     },
//     {
//       room_number: 'T-01',
//       room_building: "Men's Hall",
//       room_type: 'shared',
//       room_stay_type: 'transient',
//       room_capacity: 4,
//       room_current_occupancy: 0,
//       room_availability: 'available',
//       room_rent: 12000, // ₱400/day × ~30 days equivalent
//       tenant_restriction: 'non-coed',
//       inclusions: ['Study desk', 'Cabinet'],
//     },
//   ],
// }

const womens_residence_hall: DormSeedData = {
  accommodation_name: "Women's Residence Hall",
  accommodation_location:
    'Lower Campus, UPLB, College, Los Baños, Laguna 4031',
  latitude: 14.166650,
  longitude: 121.241200,
  accommodation_type: 'on-campus',
  tenant_restriction: 'female-only',
  accommodation_capacity: 250,
  walking_distance: 18,
  biking_distance: 7,
  driving_distance: 4,
  application_start_date: '2026-06-01',
  application_end_date: '2026-07-15',
  images: [
    'WRH_front.jpg',
  ],
  tags: [
    'On-campus housing',
    'UP-owned',
    'Female-exclusive',
    'Cafeteria on-site',
    'Subsidized rates',
    '24/7 Security',
  ],
  rooms: [
    {
      room_number: '101',
      room_building: "Women's Hall",
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 5,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '102',
      room_building: "Women's Hall",
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 5,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '201',
      room_building: "Women's Hall",
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '202',
      room_building: "Women's Hall",
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 5,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: 'T-01',
      room_building: "Women's Hall",
      room_type: 'shared',
      room_stay_type: 'transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 12000,
      tenant_restriction: 'non-coed',
      inclusions: ['Study desk', 'Cabinet'],
    },
  ],
}

const foreha: DormSeedData = {
  accommodation_name: 'Forestry Residence Hall',
  accommodation_location:
    'Forestry Road, Upper Campus, UPLB, College, Los Baños, Laguna',
  latitude: 14.161800,
  longitude: 121.237500,
  accommodation_type: 'on-campus',
  tenant_restriction: 'female-only',
  accommodation_capacity: 200,
  walking_distance: 30,
  biking_distance: 12,
  driving_distance: 6,
  application_start_date: '2026-06-01',
  application_end_date: '2026-07-15',
  images: [
    'FOREHA_front.jpg',
    'FOREHA_room.jpg',
  ],
  tags: [
    'On-campus housing',
    'UP-owned',
    'Female-exclusive',
    'Near Forestry College',
    'Subsidized rates',
    '24/7 Security',
  ],
  rooms: [
    {
      room_number: '101',
      room_building: 'Forestry Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '102',
      room_building: 'Forestry Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '103',
      room_building: 'Forestry Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 5,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '201',
      room_building: 'Forestry Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
  ],
}

//new forestry residence hall
const nfrh: DormSeedData = {
  accommodation_name: 'New Forestry Residence Hall',
  accommodation_location:
    'Forestry Road, Upper Campus, UPLB, College, Los Baños, Laguna',
  latitude: 14.161200,
  longitude: 121.237000,
  accommodation_type: 'on-campus',
  tenant_restriction: 'male-only',
  accommodation_capacity: 180,
  walking_distance: 32,
  biking_distance: 13,
  driving_distance: 7,
  application_start_date: '2026-06-01',
  application_end_date: '2026-07-15',
  images: [
    'NFRH_front.jpg',
  ],
  tags: [
    'On-campus housing',
    'UP-owned',
    'Male-exclusive',
    'Near Forestry College',
    'Subsidized rates',
    '24/7 Security',
  ],
  rooms: [
    {
      room_number: '101',
      room_building: 'New Forestry Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '102',
      room_building: 'New Forestry Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '201',
      room_building: 'New Forestry Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '202',
      room_building: 'New Forestry Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 3,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
  ],
}

const vetmed_residence_hall: DormSeedData = {
  accommodation_name: 'VetMed Residence Hall',
  accommodation_location:
    'College of Veterinary Medicine, Lower Campus, UPLB, College, Los Baños, Laguna',
  latitude: 14.168100,
  longitude: 121.243500,
  accommodation_type: 'on-campus',
  tenant_restriction: 'female-only',
  accommodation_capacity: 150,
  walking_distance: 20,
  biking_distance: 8,
  driving_distance: 4,
  application_start_date: '2026-06-01',
  application_end_date: '2026-07-15',
  images: [
    'VMRH_front.jpg',
    'VMRH_room.jpg',
  ],
  tags: [
    'On-campus housing',
    'UP-owned',
    'Female-exclusive',
    'Near Vet Med College',
    'Subsidized rates',
    '24/7 Security',
  ],
  rooms: [
    {
      room_number: '101',
      room_building: 'VetMed Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '102',
      room_building: 'VetMed Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: '201',
      room_building: 'VetMed Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 3,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC,
    },
    {
      room_number: 'T-01',
      room_building: 'VetMed Hall',
      room_type: 'shared',
      room_stay_type: 'transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 12000,
      tenant_restriction: 'non-coed',
      inclusions: ['Study desk', 'Cabinet'],
    },
  ],
}

// const ati_ntc: DormSeedData = {
//   accommodation_name: 'ATI NTC Residence Hall',
//   accommodation_location:
//     'ATI-NTC Compound, Lower Campus, UPLB, College, Los Baños, Laguna',
//   latitude: 14.167400,
//   longitude: 121.240600,
//   accommodation_type: 'on-campus',
//   tenant_restriction: 'female-only',
//   accommodation_capacity: 120,
//   walking_distance: 16,
//   biking_distance: 6,
//   driving_distance: 3,
//   application_start_date: '2026-06-01',
//   application_end_date: '2026-07-15',
//   images: [
//     'ATINTC_front.jpg',
//     'ATINTC_room.jpg',
//     'ATINTC_outside.jpg',
//   ],
//   tags: [
//     'On-campus housing',
//     'UP-owned',
//     'Female-exclusive',
//     'Subsidized rates',
//     'Air-conditioned rooms',
//     '24/7 Security',
//   ],
//   rooms: [
//     {
//       room_number: '101',
//       room_building: 'ATI-NTC Hall',
//       room_type: 'shared',
//       room_stay_type: 'non_transient',
//       room_capacity: 4,
//       room_current_occupancy: 0,
//       room_availability: 'available',
//       room_rent: 800,
//       tenant_restriction: 'non-coed',
//       reservation_fee_type: 'fixed',
//       reservation_fee_value: 800,
//       inclusions: ['Study desk', 'Cabinet', 'Aircon', 'Private bath'],
//     },
//     {
//       room_number: '102',
//       room_building: 'ATI-NTC Hall',
//       room_type: 'shared',
//       room_stay_type: 'non_transient',
//       room_capacity: 4,
//       room_current_occupancy: 0,
//       room_availability: 'available',
//       room_rent: 800,
//       tenant_restriction: 'non-coed',
//       reservation_fee_type: 'fixed',
//       reservation_fee_value: 800,
//       inclusions: ['Study desk', 'Cabinet', 'Aircon', 'Private bath'],
//     },
//     {
//       room_number: '201',
//       room_building: 'ATI-NTC Hall',
//       room_type: 'shared',
//       room_stay_type: 'non_transient',
//       room_capacity: 3,
//       room_current_occupancy: 0,
//       room_availability: 'available',
//       room_rent: 800,
//       tenant_restriction: 'non-coed',
//       reservation_fee_type: 'fixed',
//       reservation_fee_value: 800,
//       inclusions: ['Study desk', 'Cabinet', 'Aircon', 'Private bath'],
//     },
//   ],
// }

const new_dorm_residence_hall: DormSeedData = {
  accommodation_name: 'New Dormitory Residence Hall',
  accommodation_location:
    'Lower Campus, UPLB, College, Los Baños, Laguna 4031',
  latitude: 14.166900,
  longitude: 121.242100,
  accommodation_type: 'on-campus',
  tenant_restriction: 'female-only',
  accommodation_capacity: 200,
  walking_distance: 17,
  biking_distance: 7,
  driving_distance: 4,
  application_start_date: '2026-06-01',
  application_end_date: '2026-07-15',
  images: [
    'NDRH_front.jpg',
    'NDRH_room.jpg',
    'NDRH_hallway.jpg',
  ],
  tags: [
    'On-campus housing',
    'UP-owned',
    'Female-exclusive',
    'Subsidized rates',
    '24/7 Security',
    'Newer facility',
  ],
  rooms: [
    {
      room_number: '101',
      room_building: 'New Dorm Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC_WIFI,
    },
    {
      room_number: '102',
      room_building: 'New Dorm Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC_WIFI,
    },
    {
      room_number: '201',
      room_building: 'New Dorm Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC_WIFI,
    },
    {
      room_number: '202',
      room_building: 'New Dorm Hall',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 3,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC_WIFI,
    },
  ],
}

const international_house: DormSeedData = {
  accommodation_name: 'International House Residence Hall',
  accommodation_location:
    'Int\'l House Road, Lower Campus, UPLB, College, Los Baños, Laguna',
  latitude: 14.167800,
  longitude: 121.240000,
  accommodation_type: 'on-campus',
  tenant_restriction: 'coed', // Lingap scholars M/F; international students
  accommodation_capacity: 100,
  walking_distance: 15,
  biking_distance: 6,
  driving_distance: 3,
  application_start_date: '2026-06-01',
  application_end_date: '2026-07-15',
  images: [
    'IH_front.jpg',
    'IH_room.jpg',
    'IH_lounge.jpg',
    'IH_outside.jpg',
  ],
  tags: [
    'On-campus housing',
    'UP-owned',
    'International students',
    'Lingap Scholars',
    'Subsidized rates',
    '24/7 Security',
  ],
  rooms: [
    {
      room_number: '101',
      room_building: 'Int\'l House',
      room_type: 'double',
      room_stay_type: 'non_transient',
      room_capacity: 2,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC_WIFI,
    },
    {
      room_number: '102',
      room_building: 'Int\'l House',
      room_type: 'double',
      room_stay_type: 'non_transient',
      room_capacity: 2,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC_WIFI,
    },
    {
      room_number: '201',
      room_building: 'Int\'l House',
      room_type: 'shared',
      room_stay_type: 'non_transient',
      room_capacity: 4,
      room_current_occupancy: 0,
      room_availability: 'available',
      room_rent: 800,
      tenant_restriction: 'non-coed',
      reservation_fee_type: 'fixed',
      reservation_fee_value: 800,
      inclusions: OSH_BASIC_WIFI,
    },
  ],
}

export const UPLB_DORMS: DormSeedData[] = [
  //call dorm data here
  makiling_residence_hall,
  //mens_residence_hall,
  womens_residence_hall,
  foreha,
  nfrh,
  vetmed_residence_hall,
  //ati_ntc,
  new_dorm_residence_hall,
  international_house
]
