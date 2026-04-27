import vine from '@vinejs/vine'

export const createRoomValidator = vine.compile(
  vine.object({
    room_number: vine.string(),
    room_type: vine.enum(['single', 'double', 'shared']),
    room_stay_type: vine.enum(['transient', 'non_transient']),
    room_capacity: vine.number().min(1),
    room_building: vine.string(),
    room_rent: vine.number().min(0),
    tenant_restriction: vine.enum(['coed', 'non-coed']),
    tags: vine.array(vine.string().minLength(1)).optional(),
  })
)

export const updateRoomValidator = vine.compile(
  vine.object({
    room_rent: vine.number().min(0).optional(),
    room_capacity: vine.number().min(1).optional(),
    room_type: vine.enum(['single', 'double', 'shared']).optional(),
    room_availability: vine.enum(['available', 'occupied', 'maintenance']).optional(),
    tags: vine.array(vine.string().minLength(1)).optional(),
  })
)
