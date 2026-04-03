import vine from '@vinejs/vine'

// Validator for POST (All fields required)
export const createRoomValidator = vine.create({
    room_number: vine.string(),
    room_type: vine.enum(['single', 'double', 'shared']),
    room_stay_type: vine.enum(['transient', 'non_transient']),
    room_capacity: vine.number().min(1),
    room_building: vine.string(),
    room_rent: vine.number().min(0),
    tenant_restriction: vine.enum(['coed', 'non-coed'])
  }
)

// Validator for PUT (All fields optional)
export const updateRoomValidator = vine.create({
    room_rent: vine.number().min(0).optional(),
    room_capacity: vine.number().min(1).optional(),
    room_type: vine.enum(['single', 'double', 'shared']).optional(),
    room_availability: vine.enum(['available', 'occupied', 'maintenance']).optional()
  }
)