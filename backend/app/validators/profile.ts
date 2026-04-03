import vine from '@vinejs/vine'

export const setupProfileValidator = vine.compile(
  vine.object({
    // Determine the role being applied for
    role: vine.enum(['student', 'landlord']),

    // ==========================================
    // STUDENT SPECIFIC FIELDS
    // ==========================================
    student_number: vine
      .string()
      .regex(/^20\d{2}-\d{5}$/) // format: 20dd-ddddd
      .optional() // optional except when the role equals 'student'.
      .requiredWhen('role', '=', 'student'),

    phone_number: vine
      .string()
      .regex(/^09\d{9}$/),

    degree_program: vine
      .string() //follow the migrations
      .optional()
      .requiredWhen('role', '=', 'student'),

    college: vine.string().optional().requiredWhen('role', '=', 'student'),

    emergency_contact_name: vine.string().optional().requiredWhen('role', '=', 'student'),

    emergency_contact_number: vine.string().optional().requiredWhen('role', '=', 'student'),

    gender: vine
      .enum(['Male', 'Female']) // (for Male-only or Female-only dorms)
      .optional()
      .requiredWhen('role', '=', 'student'),

    form5: vine
      .array(
        vine.file({
          size: '16mb',
          extnames: ['pdf', 'png', 'jpg', 'jpeg'],
        })
      )
      .optional()
      .requiredWhen('role', '=', 'student'),

    // ==========================================
    // LANDLORD SPECIFIC FIELDS
    // ==========================================
    tin: vine
      .string()
      .regex(/^(\d{3}-\d{3}-\d{3}-\d{5}|\d{3}-\d{3}-\d{3}-\d{3})$/) // format: ddd-ddd-ddd-ddddd or ddd-ddd-ddd-ddd
      .optional() // Optional for testing for now, but remove this in actual production
      .requiredWhen('role', '=', 'landlord'),

    contact_number: vine.string().optional().requiredWhen('role', '=', 'landlord'),

    // ==========================================
    // ACCOMMODATION SPECIFIC FIELDS
    // ==========================================
    accommodationName: vine.string().optional().requiredWhen('role', '=', 'landlord'),

    accommodationLocation: vine.string().optional().requiredWhen('role', '=', 'landlord'),

    accommodationType: vine
      .enum(['on-campus', 'off-campus', 'partner_housing'])
      .optional()
      .requiredWhen('role', '=', 'landlord'),

    accommodationCapacity: vine.number().optional().requiredWhen('role', '=', 'landlord'),

    tenantRestriction: vine
      .enum(['male-only', 'female-only', 'coed'])
      .optional()
      .requiredWhen('role', '=', 'landlord'),
    applicationStartDate: vine.date().optional().requiredWhen('role', '=', 'landlord'),

    applicationEndDate: vine.date().optional().requiredWhen('role', '=', 'landlord'),

    businessPermit: vine
      .array(
        vine.file({
          size: '16mb',
          extnames: ['pdf', 'png', 'jpg', 'jpeg'],
        })
      )
      .optional()
      .requiredWhen('role', '=', 'landlord'),
  })
)
