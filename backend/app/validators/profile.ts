import vine from '@vinejs/vine'

export const setupProfileValidator = vine.compile(
    vine.object({
    // Determine the role being applied for
    role: vine.enum(['Student', 'Landlord']),

    // ==========================================
    // STUDENT SPECIFIC FIELDS
    // ==========================================
    studentNumber: vine.string()
    .regex(/^20\d{2}-\d{5}$/)               // format: 20dd-ddddd
    .optional()                             // optional except when the role equals 'Student'.
    .requiredWhen('role', '=', 'Student'),  
    
    degreeProgram: vine.string()
    .optional()
    .requiredWhen('role', '=', 'Student'),

    college: vine.string()
    .optional()
    .requiredWhen('role', '=', 'Student'),

    emergencyContactName: vine.string()
    .optional()
    .requiredWhen('role', '=', 'Student'),

    emergencyContactNumber: vine.string()
    .optional()
    .requiredWhen('role', '=', 'Student'),

    gender: vine.enum(['Male', 'Female'])   // (for Male-only or Female-only dorms)
    .optional()
    .requiredWhen('role', '=', 'Student'),

    form5: vine.file({
      size: '16mb',
      extnames: ['pdf', 'png', 'jpg', 'jpeg'],
    })
      .optional()
      .requiredWhen('role', '=', 'Student'),

    // uplbId: vine.file({
    //   size: '16mb',
    //   extnames: ['pdf', 'png', 'jpg', 'jpeg'],
    // })
    //   .optional()
    //   .requiredWhen('role', '=', 'Student'),
    
    // ==========================================
    // LANDLORD SPECIFIC FIELDS
    // ==========================================
    tin: vine.string()
    .regex(/^(\d{3}-\d{3}-\d{3}-\d{5}|\d{3}-\d{3}-\d{3}-\d{3})$/)   // format: ddd-ddd-ddd-ddddd or ddd-ddd-ddd-ddd
    .optional()
    .requiredWhen('role', '=', 'Landlord'),

    contactNumber: vine.string()
    .optional()
    .requiredWhen('role', '=', 'Landlord'),
    
    // ==========================================
    // ACCOMMODATION SPECIFIC FIELDS
    // ==========================================
    accommodationName: vine.string()
      .optional()
      .requiredWhen('role', '=', 'Landlord'),

    accommodationLocation: vine.string()
      .optional()
      .requiredWhen('role', '=', 'Landlord'),

    accommodationType: vine.enum(['on-campus', 'off-campus', 'partner_housing'])
      .optional()
      .requiredWhen('role', '=', 'Landlord'),

    accommodationCapacity: vine.number()
      .optional()
      .requiredWhen('role', '=', 'Landlord'),

    tenantRestriction: vine.enum(['male-only', 'female-only', 'coed'])
      .optional()
      .requiredWhen('role', '=', 'Landlord'),
    applicationStartDate: vine.date()
      .optional()
      .requiredWhen('role', '=', 'Landlord'),

    applicationEndDate: vine.date()
      .optional()
      .requiredWhen('role', '=', 'Landlord'),

    businessPermit: vine.file({
      size: '16mb',
      extnames: ['pdf', 'png', 'jpg', 'jpeg'],
    })
      .optional()
      .requiredWhen('role', '=', 'Landlord'),
  })
)