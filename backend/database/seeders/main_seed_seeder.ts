import db from '@adonisjs/lucid/services/db'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // =========================================================================
    // 1. FILE METADATA
    // =========================================================================
    await db.table('file_metadata').multiInsert([
      // Profile Images
      { file_name: 'pfp_1.jpg', file_path: '/uploads/images/pfp_1.jpg', file_type: 'image' },
      { file_name: 'pfp_2.jpg', file_path: '/uploads/images/pfp_2.jpg', file_type: 'image' },
      { file_name: 'pfp_3.jpg', file_path: '/uploads/images/pfp_3.jpg', file_type: 'image' },
      { file_name: 'pfp_4.jpg', file_path: '/uploads/images/pfp_4.jpg', file_type: 'image' },
      { file_name: 'pfp_5.jpg', file_path: '/uploads/images/pfp_5.jpg', file_type: 'image' },
      { file_name: 'pfp_6.jpg', file_path: '/uploads/images/pfp_6.jpg', file_type: 'image' },
      { file_name: 'pfp_7.jpg', file_path: '/uploads/images/pfp_7.jpg', file_type: 'image' },
      { file_name: 'pfp_8.jpg', file_path: '/uploads/images/pfp_8.jpg', file_type: 'image' },
      { file_name: 'pfp_9.jpg', file_path: '/uploads/images/pfp_9.jpg', file_type: 'image' },
      { file_name: 'pfp_10.jpg', file_path: '/uploads/images/pfp_10.jpg', file_type: 'image' },
      { file_name: 'pfp_11.jpg', file_path: '/uploads/images/pfp_11.jpg', file_type: 'image' },
      { file_name: 'pfp_12.jpg', file_path: '/uploads/images/pfp_12.jpg', file_type: 'image' },
      { file_name: 'pfp_13.jpg', file_path: '/uploads/images/pfp_13.jpg', file_type: 'image' },
      { file_name: 'pfp_14.jpg', file_path: '/uploads/images/pfp_14.jpg', file_type: 'image' },
      { file_name: 'pfp_15.jpg', file_path: '/uploads/images/pfp_15.jpg', file_type: 'image' },
      { file_name: 'pfp_16.jpg', file_path: '/uploads/images/pfp_16.jpg', file_type: 'image' },
      { file_name: 'pfp_17.jpg', file_path: '/uploads/images/pfp_17.jpg', file_type: 'image' },
      { file_name: 'pfp_18.jpg', file_path: '/uploads/images/pfp_18.jpg', file_type: 'image' },
      // Enrollment Proofs
      { file_name: 'enroll_2023123456.pdf', file_path: '/uploads/documents/enroll_2023123456.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123457.pdf', file_path: '/uploads/documents/enroll_2023123457.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123458.pdf', file_path: '/uploads/documents/enroll_2023123458.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123459.pdf', file_path: '/uploads/documents/enroll_2023123459.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123460.pdf', file_path: '/uploads/documents/enroll_2023123460.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123461.pdf', file_path: '/uploads/documents/enroll_2023123461.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123462.pdf', file_path: '/uploads/documents/enroll_2023123462.pdf', file_type: 'document' },

      { file_name: 'enroll_2023123463.pdf', file_path: '/uploads/documents/enroll_2023123463.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123464.pdf', file_path: '/uploads/documents/enroll_2023123464.pdf', file_type: 'document' },
      // Reports
      { file_name: 'report_1.pdf', file_path: '/uploads/documents/report_1.pdf', file_type: 'document' },
      { file_name: 'report_2.pdf', file_path: '/uploads/documents/report_2.pdf', file_type: 'document' },
      { file_name: 'report_3.pdf', file_path: '/uploads/documents/report_3.pdf', file_type: 'document' },
      { file_name: 'report_4.pdf', file_path: '/uploads/documents/report_4.pdf', file_type: 'document' },
      { file_name: 'report_5.pdf', file_path: '/uploads/documents/report_5.pdf', file_type: 'document' },
      // Business Permits
      { file_name: 'business_permit_1.pdf', file_path: '/uploads/documents/business_permit_1.pdf', file_type: 'document' },
      { file_name: 'business_permit_2.pdf', file_path: '/uploads/documents/business_permit_2.pdf', file_type: 'document' },
      { file_name: 'business_permit_3.pdf', file_path: '/uploads/documents/business_permit_3.pdf', file_type: 'document' },
      { file_name: 'business_permit_4.pdf', file_path: '/uploads/documents/business_permit_4.pdf', file_type: 'document' },
      { file_name: 'business_permit_5.pdf', file_path: '/uploads/documents/business_permit_5.pdf', file_type: 'document' },
      { file_name: 'business_permit_6.pdf', file_path: '/uploads/documents/business_permit_6.pdf', file_type: 'document' },
      { file_name: 'business_permit_uble.pdf', file_path: '/uploads/documents/business_permit_uble.pdf', file_type: 'document' },
      // Accommodation Images
      { file_name: 'accom1_img1.jpg', file_path: '/uploads/images/accom1_img1.jpg', file_type: 'image' },
      { file_name: 'accom1_img2.jpg', file_path: '/uploads/images/accom1_img2.jpg', file_type: 'image' },
      { file_name: 'accom2_img1.jpg', file_path: '/uploads/images/accom2_img1.jpg', file_type: 'image' },
      { file_name: 'accom2_img2.jpg', file_path: '/uploads/images/accom2_img2.jpg', file_type: 'image' },
      { file_name: 'accom3_img1.jpg', file_path: '/uploads/images/accom3_img1.jpg', file_type: 'image' },
      { file_name: 'accom3_img2.jpg', file_path: '/uploads/images/accom3_img2.jpg', file_type: 'image' },
      { file_name: 'accom4_img1.jpg', file_path: '/uploads/images/accom4_img1.jpg', file_type: 'image' },
      { file_name: 'accom4_img2.jpg', file_path: '/uploads/images/accom4_img2.jpg', file_type: 'image' },
      { file_name: 'accom5_img1.jpg', file_path: '/uploads/images/accom5_img1.jpg', file_type: 'image' },
      { file_name: 'accom5_img2.jpg', file_path: '/uploads/images/accom5_img2.jpg', file_type: 'image' },
      { file_name: 'accom6_img1.jpg', file_path: '/uploads/images/accom6_img1.jpg', file_type: 'image' },
      { file_name: 'accom6_img2.jpg', file_path: '/uploads/images/accom6_img2.jpg', file_type: 'image' },
      // Payments
      { file_name: 'payment_1.jpg', file_path: '/uploads/images/payment_1.jpg', file_type: 'image' },
      { file_name: 'payment_2.jpg', file_path: '/uploads/images/payment_2.jpg', file_type: 'image' },
      { file_name: 'payment_3.jpg', file_path: '/uploads/images/payment_3.jpg', file_type: 'image' },
      // Other Docs
      { file_name: 'doc_img_1.jpg', file_path: '/uploads/documents/doc_1.pdf', file_type: 'document' },
      { file_name: 'doc_img_2.jpg', file_path: '/uploads/documents/doc_2.pdf', file_type: 'document' },
      { file_name: 'doc_img_3.jpg', file_path: '/uploads/documents/doc_3.pdf', file_type: 'document' },
      { file_name: 'doc_img_4.jpg', file_path: '/uploads/documents/doc_4.pdf', file_type: 'document' },
      { file_name: 'doc_img_5.jpg', file_path: '/uploads/documents/doc_5.pdf', file_type: 'document' }
    ])

    // --- DYNAMIC FETCH: FILES ---
    const allFiles = await db.from('file_metadata').select('id', 'file_name')
    const getFile = (name: string) => allFiles.find(f => f.file_name === name)?.id

    // =========================================================================
    // 2. USERS
    // =========================================================================
    await db.table('users').multiInsert([
      // Students
      { pfp_file_id: getFile('pfp_1.jpg'), fname: 'Louise Natasha', mname: 'Valeria', lname: 'Martinez', suffix: null, email: 'lvmartinez@up.edu.ph', facebook_account: 'facebook.com/luna.valeria', role: 'student' },
      { pfp_file_id: getFile('pfp_2.jpg'), fname: 'Avrielle Haven', mname: 'Fernandez', lname: 'Juarez', suffix: null, email: 'afjuarez@up.edu.ph', facebook_account: 'facebook.com/avie.juarez', role: 'student' },
      { pfp_file_id: getFile('pfp_3.jpg'), fname: 'Samantha Maureen', mname: 'Vera', lname: 'Ramirez', suffix: null, email: 'svramirez@up.edu.ph', facebook_account: 'facebook.com/sam.ramirez', role: 'student' },
      { pfp_file_id: getFile('pfp_4.jpg'), fname: 'Avianna Rye', mname: 'Castillo', lname: 'Cruz', suffix: null, email: 'accruz@up.edu.ph', facebook_account: 'facebook.com/via.cruz', role: 'student' },
      { pfp_file_id: getFile('pfp_5.jpg'), fname: 'Daniel Joseph', mname: 'Flores', lname: 'Santos', suffix: null, email: 'djsantos@up.edu.ph', facebook_account: 'facebook.com/daniel.santos', role: 'student' },
      { pfp_file_id: getFile('pfp_6.jpg'), fname: 'Kristine Joy', mname: 'Mendoza', lname: 'Villanueva', suffix: null, email: 'kjvillanueva@up.edu.ph', facebook_account: 'facebook.com/kristine.villanueva', role: 'student' },
      { pfp_file_id: getFile('pfp_7.jpg'), fname: 'Joshua Daniel', mname: 'Castro', lname: 'Aguilar', suffix: null, email: 'jdaguilar@up.edu.ph', facebook_account: 'facebook.com/joshua.aguilar', role: 'student' },
      // Landlords
      { pfp_file_id: getFile('pfp_8.jpg'), fname: 'Larkin', mname: 'Diaz', lname: 'Sanchez', suffix: 'III', email: 'larkinsanchez@gmail.com', facebook_account: 'facebook.com/kino3.juarez', role: 'landlord' },
      { pfp_file_id: getFile('pfp_9.jpg'), fname: 'Carlos Miguel', mname: 'Reyes', lname: 'Navarro', suffix: null, email: 'cmnavarro@gmail.com', facebook_account: 'facebook.com/carlos.navarro', role: 'landlord' },
      { pfp_file_id: getFile('pfp_10.jpg'), fname: 'Patricia Anne', mname: 'Lopez', lname: 'Garcia', suffix: null, email: 'pagarcia@up.edu.ph', facebook_account: 'facebook.com/patricia.garcia', role: 'landlord' },
      { pfp_file_id: getFile('pfp_11.jpg'), fname: 'Rafael Antonio', mname: 'Gutierrez', lname: 'Ortega', suffix: 'Jr', email: 'raortega@gmail.com', facebook_account: 'facebook.com/rafael.ortega', role: 'landlord' },
      { pfp_file_id: getFile('pfp_12.jpg'), fname: 'Nicole Therese', mname: 'Domingo', lname: 'Ramos', suffix: null, email: 'ntramos@gmail.com', facebook_account: 'facebook.com/nicole.ramos', role: 'landlord' },
      // Managers
      { pfp_file_id: getFile('pfp_13.jpg'), fname: 'Juan', mname: 'Santos', lname: 'Dela Cruz', suffix: null, email: 'juan.delacruz@gmail.com', facebook_account: 'facebook.com/juan.delacruz', role: 'manager' },
      { pfp_file_id: getFile('pfp_14.jpg'), fname: 'Seven Manuel', mname: 'Ladezma', lname: 'Camero', suffix: 'Jr', email: 'slmanuel@up.edu.ph', facebook_account: 'facebook.com/seve.camero', role: 'manager' },
      { pfp_file_id: getFile('pfp_15.jpg'), fname: 'Michael Angelo', mname: 'Torres', lname: 'Bautista', suffix: null, email: 'mabautista@gmail.com', facebook_account: 'facebook.com/michael.bautista', role: 'manager' },
      { pfp_file_id: getFile('pfp_16.jpg'), fname: 'Angela Marie', mname: 'Salazar', lname: 'Pineda', suffix: null, email: 'ampineda@up.edu.ph', facebook_account: 'facebook.com/angela.pineda', role: 'manager' },
      { pfp_file_id: getFile('pfp_17.jpg'), fname: 'Victor Emmanuel', mname: 'Alvarez', lname: 'Padilla', suffix: null, email: 'vepadilla@gmail.com', facebook_account: 'facebook.com/victor.padilla', role: 'manager' },
      { pfp_file_id: getFile('pfp_18.jpg'), fname: 'Andy Emmanuel', mname: 'Padilla', lname: 'Alvarez', suffix: null, email: 'aralvarez@gmail.com', facebook_account: 'facebook.com/andy.alvarez', role: 'manager' }, 
      
      { 
        pfp_file_id: getFile('pfp_1.jpg'),
        fname: 'Ana Marie',
        mname: null,
        lname: 'Reyes',
        suffix: null,
        email: 'pending.student1@up.edu.ph',
        facebook_account: 'facebook.com/ana.reyes',
        role: 'unassigned'
      },
      { 
        pfp_file_id: getFile('pfp_2.jpg'),
        fname: 'John Paul',
        mname: null,
        lname: 'Santos',
        suffix: null,
        email: 'pending.student2@up.edu.ph',
        facebook_account: 'facebook.com/john.santos',
        role: 'unassigned'
      },
      {
        pfp_file_id: getFile('pfp_8.jpg'),
        fname: 'Carla',
        mname: null,
        lname: 'Navarro',
        suffix: null,
        email: 'pending.landlord1@gmail.com',
        facebook_account: 'facebook.com/carla.navarro',
        role: 'unassigned'
      },

      // ── UBLE test account ──────────────────────────────────────────────────
      // NOTE: uble.ics.uplb@gmail.com is already created by admin_seeder — only add the manager here.
      {
        pfp_file_id: getFile('pfp_2.jpg'),
        fname: 'Rosa',
        mname: null,
        lname: 'Dela Cruz',
        suffix: null,
        email: 'manager.uble.test@gmail.com',
        facebook_account: null,
        role: 'manager',
      },
    ])

    // --- DYNAMIC FETCH: USERS ---
    const allUsers = await db.from('users').select('id', 'email')
    // We will use getUser() everywhere for Landlords and Managers now!
    const getUser = (email: string) => allUsers.find(u => u.email === email)?.id

    // =========================================================================
    // 3. PHONE NUMBERS
    // =========================================================================
    await db.table('phone_numbers').multiInsert([
      { user_id: getUser('lvmartinez@up.edu.ph'), contact_number: '09171234567', is_primary: true },
      { user_id: getUser('afjuarez@up.edu.ph'), contact_number: '09625494265', is_primary: true },
      { user_id: getUser('svramirez@up.edu.ph'), contact_number: '09123456789', is_primary: true },
      { user_id: getUser('accruz@up.edu.ph'), contact_number: '09175678321', is_primary: true },
      { user_id: getUser('djsantos@up.edu.ph'), contact_number: '09681234567', is_primary: true },
      { user_id: getUser('kjvillanueva@up.edu.ph'), contact_number: '09751239876', is_primary: true },
      { user_id: getUser('jdaguilar@up.edu.ph'), contact_number: '09182345678', is_primary: true },
      { user_id: getUser('larkinsanchez@gmail.com'), contact_number: '09913456721', is_primary: true },
      { user_id: getUser('cmnavarro@gmail.com'), contact_number: '09674561234', is_primary: true },
      { user_id: getUser('pagarcia@up.edu.ph'), contact_number: '09196783421', is_primary: true },
      { user_id: getUser('raortega@gmail.com'), contact_number: '09872345611', is_primary: true },
      { user_id: getUser('ntramos@gmail.com'), contact_number: '09784561239', is_primary: true },
      { user_id: getUser('juan.delacruz@gmail.com'), contact_number: '09165478322', is_primary: true },
      { user_id: getUser('slmanuel@up.edu.ph'), contact_number: '09987654321', is_primary: true },
      { user_id: getUser('mabautista@gmail.com'), contact_number: '09686229361', is_primary: true },
      { user_id: getUser('ampineda@up.edu.ph'), contact_number: '09182872048', is_primary: true },
      { user_id: getUser('vepadilla@gmail.com'), contact_number: '09194561234', is_primary: true },
      { user_id: getUser('aralvarez@gmail.com'), contact_number: '09174562318', is_primary: true },
      { user_id: getUser('jdaguilar@up.edu.ph'), contact_number: '09682345761', is_primary: false },
      { user_id: getUser('slmanuel@up.edu.ph'), contact_number: '09916543287', is_primary: false },
      { user_id: getUser('ampineda@up.edu.ph'), contact_number: '09185673429', is_primary: false },
      { user_id: getUser('vepadilla@gmail.com'), contact_number: '09793456128', is_primary: false },
      // UBLE manager phone
      { user_id: getUser('manager.uble.test@gmail.com'), contact_number: '09191234567', is_primary: true },
    ])

    // =========================================================================
    // 4. LANDLORDS & MANAGERS & STUDENTS
    // =========================================================================
    await db.table('landlords').multiInsert([
      { user_id: getUser('larkinsanchez@gmail.com'), tin: '123-456-789-000' },
      { user_id: getUser('cmnavarro@gmail.com'), tin: '234-567-890-111' },
      { user_id: getUser('pagarcia@up.edu.ph'), tin: '345-678-901-222' },
      { user_id: getUser('raortega@gmail.com'), tin: '456-789-012-333' },
      { user_id: getUser('ntramos@gmail.com'), tin: '567-890-123-444' },
      
      {
        user_id: getUser('pending.landlord1@gmail.com'),
        tin: '678-901-234-555'
      },
      // NOTE: UBLE landlord record already created by admin_seeder — skip here.
    ])

    await db.table('managers').multiInsert([
      { user_id: getUser('juan.delacruz@gmail.com'), manager_status: 'active' },
      { user_id: getUser('slmanuel@up.edu.ph'), manager_status: 'active' },
      { user_id: getUser('mabautista@gmail.com'), manager_status: 'active' },
      { user_id: getUser('ampineda@up.edu.ph'), manager_status: 'inactive' },
      { user_id: getUser('vepadilla@gmail.com'), manager_status: 'active' },
      { user_id: getUser('aralvarez@gmail.com'), manager_status: 'active' },
      // UBLE manager
      { user_id: getUser('manager.uble.test@gmail.com'), manager_status: 'active' },
    ])

    await db.table('students').multiInsert([
      { student_number: '2023-123456', user_id: getUser('lvmartinez@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123456.pdf'), college: 'CEAT', degree_program: 'BS Industrial Engineering', gender: 'Female', emergency_contact_name: 'Kalix Martinez', emergency_contact_number: '09181234567', year_level: '3rd Year' },
      { student_number: '2023-123457', user_id: getUser('afjuarez@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123457.pdf'), college: 'CEAT', degree_program: 'BS Civil Engineering', gender: 'Female', emergency_contact_name: 'Sebastian Cameroz', emergency_contact_number: '09999159295', year_level: '2nd Year' },
      { student_number: '2023-123458', user_id: getUser('svramirez@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123458.pdf'), college: 'CEM', degree_program: 'BS Economics', gender: 'Female', emergency_contact_name: 'Ashianna Fernandez', emergency_contact_number: '09293230856', year_level: '4th Year' },
      { student_number: '2023-123459', user_id: getUser('accruz@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123459.pdf'), college: 'CAS', degree_program: 'BA Communication Arts', gender: 'Female', emergency_contact_name: 'Clyden Ramirez', emergency_contact_number: '09876543210', year_level: '1st Year' },
      { student_number: '2023-123460', user_id: getUser('djsantos@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123460.pdf'), college: 'CEAT', degree_program: 'BS Industrial Engineering', gender: 'Male', emergency_contact_name: null, emergency_contact_number: null, year_level: '2nd Year' },
      { student_number: '2023-123461', user_id: getUser('kjvillanueva@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123461.pdf'), college: 'CBA', degree_program: 'BS Accountancy', gender: 'Female', emergency_contact_name: 'Rafael Ortega', emergency_contact_number: '09172345678', year_level: '5th Year' },
      { student_number: '2023-123462', user_id: getUser('jdaguilar@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123462.pdf'), college: 'CITE', degree_program: 'BS Computer Science', gender: 'Male', emergency_contact_name: 'Victor Padilla', emergency_contact_number: '09987654321', year_level: '3rd Year' },

      {
        student_number: '2023-223456',
        user_id: getUser('pending.student1@up.edu.ph'),
        enrollment_proof_file_id: getFile('enroll_2023123463.pdf'),
        college: 'CAS',
        degree_program: 'BS Biology',
        gender: 'Female',
        emergency_contact_name: 'Maria Reyes',
        emergency_contact_number: '09171234567',
        year_level: '1st Year'
      },
      {
        student_number: '2023-223457',
        user_id: getUser('pending.student2@up.edu.ph'),
        enrollment_proof_file_id: getFile('enroll_2023123464.pdf'),
        college: 'CEM',
        degree_program: 'BS Economics',
        gender: 'Male',
        emergency_contact_name: 'Pedro Santos',
        emergency_contact_number: '09181234567',
        year_level: '4th Year'
      }
    ])

    // =========================================================================
    // 5. DOCUMENTS
    // =========================================================================
    await db.table('documents').multiInsert([
      { user_id: getUser('afjuarez@up.edu.ph'), file_id: getFile('doc_img_1.jpg'), upload_timestamp: '2026-03-01 09:15:00' },
      { user_id: getUser('svramirez@up.edu.ph'), file_id: getFile('doc_img_2.jpg'), upload_timestamp: '2026-03-02 14:30:00' },
      { user_id: getUser('accruz@up.edu.ph'), file_id: getFile('doc_img_3.jpg'), upload_timestamp: '2026-03-03 11:45:00' },
      { user_id: getUser('djsantos@up.edu.ph'), file_id: getFile('doc_img_4.jpg'), upload_timestamp: '2026-03-04 16:20:00' },
      { user_id: getUser('kjvillanueva@up.edu.ph'), file_id: getFile('doc_img_5.jpg'), upload_timestamp: '2026-03-05 08:05:00' }
    ])

    // =========================================================================
    // 6. REPORTS (Directly using getUser for Landlord IDs!)
    // =========================================================================
    await db.table('reports').multiInsert([
      { landlord_id: getUser('ntramos@gmail.com'), student_number: '2023-123456', report_file_id: getFile('report_1.pdf'), report_type: 'billing' },
      { landlord_id: getUser('cmnavarro@gmail.com'), student_number: '2023-123457', report_file_id: getFile('report_2.pdf'), report_type: 'assignment' },
      { landlord_id: getUser('larkinsanchez@gmail.com'), student_number: '2023-123459', report_file_id: getFile('report_3.pdf'), report_type: 'billing' },
      { landlord_id: getUser('larkinsanchez@gmail.com'), student_number: '2023-123461', report_file_id: getFile('report_4.pdf'), report_type: 'assignment' },
      { landlord_id: getUser('raortega@gmail.com'), student_number: '2023-123462', report_file_id: getFile('report_5.pdf'), report_type: 'billing' }
    ])

    // =========================================================================
    // 7. ACCOMMODATIONS (Directly using getUser for Landlords & Managers!)
    // =========================================================================
    await db.table('accommodations').multiInsert([
      { landlord_id: getUser('larkinsanchez@gmail.com'), manager_id: getUser('juan.delacruz@gmail.com'), business_permit_id: getFile('business_permit_1.pdf'), accommodation_name: 'White House', accommodation_location: 'Ruby St., Brgy. Batong Malake, Los Baños, Laguna', accommodation_type: 'off-campus', accommodation_capacity: 60, tenant_restriction: 'coed', status: 'verified', application_start_date: '2026-04-01', application_end_date: '2026-05-15', latitude: 14.1665, longitude: 121.2430, walking_distance: 10, biking_distance: 5, driving_distance: 3 },
      { landlord_id: getUser('cmnavarro@gmail.com'), manager_id: getUser('slmanuel@up.edu.ph'), business_permit_id: getFile('business_permit_2.pdf'), accommodation_name: 'One Silangan', accommodation_location: 'UPLB, Los Baños, Laguna', accommodation_type: 'on-campus', accommodation_capacity: 40, tenant_restriction: 'coed', status: 'verified', application_start_date: '2026-04-01', application_end_date: '2026-05-20', latitude: 14.1649, longitude: 121.2398, walking_distance: 5, biking_distance: 2, driving_distance: 2 },
      { landlord_id: getUser('pagarcia@up.edu.ph'), manager_id: getUser('mabautista@gmail.com'), business_permit_id: getFile('business_permit_3.pdf'), accommodation_name: "Men's Dorm", accommodation_location: 'UPLB, Los Baños, Laguna', accommodation_type: 'partner_housing', accommodation_capacity: 150, tenant_restriction: 'male-only', status: 'verified', application_start_date: '2026-03-20', application_end_date: '2026-04-30', latitude: 14.1638, longitude: 121.2410, walking_distance: 3, biking_distance: 2, driving_distance: 2 },
      { landlord_id: getUser('raortega@gmail.com'), manager_id: getUser('ampineda@up.edu.ph'), business_permit_id: getFile('business_permit_4.pdf'), accommodation_name: "ATI", accommodation_location: 'UPLB, Los Baños, Laguna', accommodation_type: 'partner_housing', accommodation_capacity: 120, tenant_restriction: 'male-only', status: 'verified', application_start_date: '2026-04-05', application_end_date: '2026-05-25', latitude: 14.1643, longitude: 121.2405, walking_distance: 4, biking_distance: 2, driving_distance: 2 },
      { landlord_id: getUser('larkinsanchez@gmail.com'), manager_id: getUser('vepadilla@gmail.com'), business_permit_id: getFile('business_permit_5.pdf'), accommodation_name: "Scholar's Dorm", accommodation_location: 'UPLB, Los Baños, Laguna', accommodation_type: 'on-campus', accommodation_capacity: 50, tenant_restriction: 'female-only', status: 'verified', application_start_date: '2026-03-25', application_end_date: '2026-05-10', latitude: 14.1655, longitude: 121.2395, walking_distance: 5, biking_distance: 2, driving_distance: 2 },
      { landlord_id: getUser('ntramos@gmail.com'), manager_id: getUser('aralvarez@gmail.com'), business_permit_id: getFile('business_permit_6.pdf'), accommodation_name: "One Sapphire Place", accommodation_location: 'Sapphire St., Brgy. Batong Malake, Los Baños, Laguna', accommodation_type: 'off-campus', accommodation_capacity: 50, tenant_restriction: 'coed', status: 'verified', application_start_date: '2026-03-25', application_end_date: '2026-05-10', latitude: 14.1672, longitude: 121.2435, walking_distance: 12, biking_distance: 6, driving_distance: 4 },
      // UBLE Residences (uble.ics.uplb@gmail.com test account)
      { landlord_id: getUser('uble.ics.uplb@gmail.com'), manager_id: getUser('manager.uble.test@gmail.com'), business_permit_id: getFile('business_permit_uble.pdf'), accommodation_name: 'UBLE Residences', accommodation_location: 'University of the Philippines Los Baños, Laguna', accommodation_type: 'on-campus', accommodation_capacity: 20, tenant_restriction: 'coed', status: 'verified', application_start_date: '2026-04-01', application_end_date: '2026-05-15', latitude: 14.1651, longitude: 121.2402, walking_distance: 5, biking_distance: 2, driving_distance: 2 },
    ])

    // --- DYNAMIC FETCH: ACCOMMODATIONS ---
    const allAccoms = await db.from('accommodations').select('id', 'accommodation_name')
    const getAccom = (name: string) => allAccoms.find(a => a.accommodation_name === name)?.id

    // =========================================================================
    // 8. TAGS, IMAGES, & REVIEWS
    // =========================================================================
    await db.table('accommodation_tags').multiInsert([
      { accommodation_id: getAccom('White House'), tag_detail: 'Near campus' },
      { accommodation_id: getAccom('White House'), tag_detail: 'Pet friendly' },
      { accommodation_id: getAccom('One Silangan'), tag_detail: 'Near Establishments' },
      { accommodation_id: getAccom('One Silangan'), tag_detail: 'Air-conditioned rooms' },
      { accommodation_id: getAccom("Men's Dorm"), tag_detail: 'Has study area' },
      { accommodation_id: getAccom("Men's Dorm"), tag_detail: '24/7 Security' },
      { accommodation_id: getAccom("ATI"), tag_detail: 'Has study area' },
      { accommodation_id: getAccom("ATI"), tag_detail: '24/7 Security' },
      { accommodation_id: getAccom("Scholar's Dorm"), tag_detail: 'Has curfew' },
      { accommodation_id: getAccom("Scholar's Dorm"), tag_detail: 'Has canteen' },
      { accommodation_id: getAccom("One Sapphire Place"), tag_detail: 'Near campus' },
      { accommodation_id: getAccom("One Sapphire Place"), tag_detail: 'Air-conditioned rooms' }
    ])

    await db.table('accommodation_images').multiInsert([
      { accommodation_id: getAccom('White House'), image_file_id: getFile('accom1_img1.jpg') },
      { accommodation_id: getAccom('White House'), image_file_id: getFile('accom1_img2.jpg') },
      { accommodation_id: getAccom('One Silangan'), image_file_id: getFile('accom2_img1.jpg') },
      { accommodation_id: getAccom('One Silangan'), image_file_id: getFile('accom2_img2.jpg') },
      { accommodation_id: getAccom("Men's Dorm"), image_file_id: getFile('accom3_img1.jpg') },
      { accommodation_id: getAccom("Men's Dorm"), image_file_id: getFile('accom3_img2.jpg') },
      { accommodation_id: getAccom("ATI"), image_file_id: getFile('accom4_img1.jpg') },
      { accommodation_id: getAccom("Scholar's Dorm"), image_file_id: getFile('accom5_img1.jpg') },
      { accommodation_id: getAccom("Scholar's Dorm"), image_file_id: getFile('accom5_img2.jpg') },
      { accommodation_id: getAccom("One Sapphire Place"), image_file_id: getFile('accom6_img1.jpg') },
      { accommodation_id: getAccom("One Sapphire Place"), image_file_id: getFile('accom6_img2.jpg') }
    ])

    await db.table('reviews').multiInsert([
      { accommodation_id: getAccom('White House'), student_number: '2023-123456', rating: 4, content: 'Clean rooms, responsive landlord, and very close to the university.' },
      { accommodation_id: getAccom('White House'), student_number: '2023-123456', rating: 3, content: 'Decent but the room is small.' },
      { accommodation_id: getAccom('One Silangan'), student_number: '2023-123456', rating: 5, content: null },
      { accommodation_id: getAccom('One Silangan'), student_number: '2023-123456', rating: 5, content: 'Clean rooms, responsive landlord, and very close to the university.' },
      { accommodation_id: getAccom("Men's Dorm"), student_number: '2023-123456', rating: 1, content: 'Maintenance needs improvement.' },
      { accommodation_id: getAccom("Men's Dorm"), student_number: '2023-123456', rating: 4, content: 'Nice location, but the internet is sometimes slow.' },
      { accommodation_id: getAccom("ATI"), rating: 2, student_number: '2023-123456', content: 'Noisy environment and needs better lighting.' },
      { accommodation_id: getAccom("ATI"), rating: 4, student_number: '2023-123456', content: 'Spacious room but shared bathroom can be crowded.' },
      { accommodation_id: getAccom("Scholar's Dorm"), rating: 3, student_number: '2023-123456', content: 'Affordable, but cleaning service is irregular.' },
      { accommodation_id: getAccom("Scholar's Dorm"), rating: 2, student_number: '2023-123456', content: 'Walls are thin, noise from neighbors is noticeable.' },
      { accommodation_id: getAccom("One Sapphire Place"), rating: 5, student_number: '2023-123456', content: 'Excellent accommodation, would highly recommend!' },
      { accommodation_id: getAccom("One Sapphire Place"), rating: 3, student_number: '2023-123456', content: 'Average stay, nothing special but decent overall.' }
    ])

    // =========================================================================
    // 9. ROOMS
    // =========================================================================
    await db.table('rooms').multiInsert([
      // --- CLARENCE TEST ROOMS ---
      { accommodation_id: getAccom('White House'), room_number: '103', room_type: 'single', room_stay_type: 'non_transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Building A', room_rent: 5500.00, tenant_restriction: 'coed', room_availability: 'available' },
      { accommodation_id: getAccom('White House'), room_number: '104', room_type: 'double', room_stay_type: 'non_transient', room_capacity: 2, room_current_occupancy: 0, room_building: 'Building A', room_rent: 7000.00, tenant_restriction: 'coed', room_availability: 'available' },
      
      { accommodation_id: getAccom('White House'), room_number: '101', room_type: 'single', room_stay_type: 'transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Building A', room_rent: 5000.00, tenant_restriction: 'coed', room_availability: 'available' },
      { accommodation_id: getAccom('White House'), room_number: '102', room_type: 'double', room_stay_type: 'transient', room_capacity: 2, room_current_occupancy: 1, room_building: 'Building A', room_rent: 6500.00, tenant_restriction: 'coed', room_availability: 'available' },
      { accommodation_id: getAccom('One Silangan'), room_number: '201', room_type: 'single', room_stay_type: 'transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Building A', room_rent: 6000.00, tenant_restriction: 'coed', room_availability: 'available' },
      { accommodation_id: getAccom('One Silangan'), room_number: '202', room_type: 'double', room_stay_type: 'transient', room_capacity: 2, room_current_occupancy: 2, room_building: 'Building A', room_rent: 7000.00, tenant_restriction: 'coed', room_availability: 'occupied' },
      { accommodation_id: getAccom("Men's Dorm"), room_number: '301', room_type: 'shared', room_stay_type: 'transient', room_capacity: 4, room_current_occupancy: 3, room_building: 'Building B', room_rent: 800.00, tenant_restriction: 'non-coed', room_availability: 'occupied' },
      { accommodation_id: getAccom("Men's Dorm"), room_number: '302', room_type: 'shared', room_stay_type: 'transient', room_capacity: 4, room_current_occupancy: 1, room_building: 'Building C', room_rent: 800.00, tenant_restriction: 'non-coed', room_availability: 'available' },
      { accommodation_id: getAccom("ATI"), room_number: '401', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 4, room_current_occupancy: 4, room_building: 'Building A', room_rent: 800.00, tenant_restriction: 'non-coed', room_availability: 'occupied' },
      { accommodation_id: getAccom("ATI"), room_number: '402', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 4, room_current_occupancy: 0, room_building: 'Building B', room_rent: 800.00, tenant_restriction: 'non-coed', room_availability: 'available' },
      { accommodation_id: getAccom("Scholar's Dorm"), room_number: '501', room_type: 'single', room_stay_type: 'non_transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Building C', room_rent: 5500.00, tenant_restriction: 'coed', room_availability: 'maintenance' },
      { accommodation_id: getAccom("Scholar's Dorm"), room_number: '502', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 3, room_current_occupancy: 2, room_building: 'Building C', room_rent: 6000.00, tenant_restriction: 'coed', room_availability: 'available' },
      { accommodation_id: getAccom('White House'), room_number: '303', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 3, room_current_occupancy: 1, room_building: 'Building A', room_rent: 4800.00, tenant_restriction: 'coed', room_availability: 'available' },
      { accommodation_id: getAccom('One Silangan'), room_number: '203', room_type: 'single', room_stay_type: 'non_transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Building B', room_rent: 6200.00, tenant_restriction: 'coed', room_availability: 'available' },
      
      { accommodation_id: getAccom("One Sapphire Place"), room_number: '601', room_type: 'single', room_stay_type: 'transient', room_capacity: 1, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 4500.00, tenant_restriction: 'coed', room_availability: 'available' },
      { accommodation_id: getAccom("One Sapphire Place"), room_number: '602', room_type: 'double', room_stay_type: 'non_transient', room_capacity: 2, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 3200.00, tenant_restriction: 'coed', room_availability: 'available' },
      // UBLE Residences rooms (capacity 8, occupied 3)
      { accommodation_id: getAccom('UBLE Residences'), room_number: '701', room_type: 'single', room_stay_type: 'non_transient', room_capacity: 1, room_current_occupancy: 1, room_building: 'Main Building', room_rent: 5500.00, tenant_restriction: 'coed', room_availability: 'occupied' },
      { accommodation_id: getAccom('UBLE Residences'), room_number: '702', room_type: 'single', room_stay_type: 'non_transient', room_capacity: 1, room_current_occupancy: 1, room_building: 'Main Building', room_rent: 5500.00, tenant_restriction: 'coed', room_availability: 'occupied' },
      { accommodation_id: getAccom('UBLE Residences'), room_number: '703', room_type: 'double', room_stay_type: 'non_transient', room_capacity: 2, room_current_occupancy: 1, room_building: 'Main Building', room_rent: 4500.00, tenant_restriction: 'coed', room_availability: 'available' },
      { accommodation_id: getAccom('UBLE Residences'), room_number: '704', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 4, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 3500.00, tenant_restriction: 'coed', room_availability: 'available' },
      { accommodation_id: getAccom('UBLE Residences'), room_number: '705', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 4, room_current_occupancy: 0, room_building: 'Main Building', room_rent: 3500.00, tenant_restriction: 'coed', room_availability: 'available' },
    ])

    const allRooms = await db.from('rooms').select('id', 'room_number', 'accommodation_id')
    const getRoom = (roomNum: string, accomName: string) => allRooms.find(r => r.room_number === roomNum && r.accommodation_id === getAccom(accomName))?.id

    // ─── ROOM TAGS ────────────────────────────────────────────────────────────
    await db.table('room_tags').multiInsert([
      // White House — 101 (single, transient)
      { room_id: getRoom('101', 'White House'), tag_detail: 'Private bathroom' },
      { room_id: getRoom('101', 'White House'), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('101', 'White House'), tag_detail: 'Ground floor' },
      // White House — 102 (double, transient)
      { room_id: getRoom('102', 'White House'), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('102', 'White House'), tag_detail: 'Has study desk' },
      { room_id: getRoom('102', 'White House'), tag_detail: 'Has wardrobe' },
      // White House — 303 (shared, non-transient)
      { room_id: getRoom('303', 'White House'), tag_detail: 'Has study desk' },
      { room_id: getRoom('303', 'White House'), tag_detail: 'Has wardrobe' },
      // One Silangan — 201 (single, transient)
      { room_id: getRoom('201', 'One Silangan'), tag_detail: 'Private bathroom' },
      { room_id: getRoom('201', 'One Silangan'), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('201', 'One Silangan'), tag_detail: 'Has ref' },
      // One Silangan — 202 (double, transient)
      { room_id: getRoom('202', 'One Silangan'), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('202', 'One Silangan'), tag_detail: 'Has study desk' },
      { room_id: getRoom('202', 'One Silangan'), tag_detail: 'Near elevator' },
      // One Silangan — 203 (single, non-transient)
      { room_id: getRoom('203', 'One Silangan'), tag_detail: 'Private bathroom' },
      { room_id: getRoom('203', 'One Silangan'), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('203', 'One Silangan'), tag_detail: 'Has balcony' },
      // Men's Dorm — 301 (shared, transient)
      { room_id: getRoom('301', "Men's Dorm"), tag_detail: 'Shared bathroom' },
      { room_id: getRoom('301', "Men's Dorm"), tag_detail: 'Has study area' },
      { room_id: getRoom('301', "Men's Dorm"), tag_detail: 'Has locker' },
      // Men's Dorm — 302 (shared, transient)
      { room_id: getRoom('302', "Men's Dorm"), tag_detail: 'Shared bathroom' },
      { room_id: getRoom('302', "Men's Dorm"), tag_detail: 'Has locker' },
      { room_id: getRoom('302', "Men's Dorm"), tag_detail: 'Ground floor' },
      // ATI — 401 (shared, non-transient)
      { room_id: getRoom('401', 'ATI'), tag_detail: 'Shared bathroom' },
      { room_id: getRoom('401', 'ATI'), tag_detail: 'Has study area' },
      { room_id: getRoom('401', 'ATI'), tag_detail: 'Has locker' },
      // ATI — 402 (shared, non-transient)
      { room_id: getRoom('402', 'ATI'), tag_detail: 'Shared bathroom' },
      { room_id: getRoom('402', 'ATI'), tag_detail: 'Has study area' },
      { room_id: getRoom('402', 'ATI'), tag_detail: 'Near comfort room' },
      // Scholar's Dorm — 501 (single, non-transient)
      { room_id: getRoom('501', "Scholar's Dorm"), tag_detail: 'Private bathroom' },
      { room_id: getRoom('501', "Scholar's Dorm"), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('501', "Scholar's Dorm"), tag_detail: 'Has study desk' },
      // Scholar's Dorm — 502 (shared, non-transient)
      { room_id: getRoom('502', "Scholar's Dorm"), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('502', "Scholar's Dorm"), tag_detail: 'Has study desk' },
      { room_id: getRoom('502', "Scholar's Dorm"), tag_detail: 'Has wardrobe' },
      // One Sapphire Place — 601 (single, transient)
      { room_id: getRoom('601', 'One Sapphire Place'), tag_detail: 'Private bathroom' },
      { room_id: getRoom('601', 'One Sapphire Place'), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('601', 'One Sapphire Place'), tag_detail: 'Has ref' },
      // One Sapphire Place — 602 (double, non-transient)
      { room_id: getRoom('602', 'One Sapphire Place'), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('602', 'One Sapphire Place'), tag_detail: 'Has study desk' },
      { room_id: getRoom('602', 'One Sapphire Place'), tag_detail: 'Has wardrobe' },
      // UBLE Residences — 701 (single)
      { room_id: getRoom('701', 'UBLE Residences'), tag_detail: 'Private bathroom' },
      { room_id: getRoom('701', 'UBLE Residences'), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('701', 'UBLE Residences'), tag_detail: 'Has study desk' },
      // UBLE Residences — 702 (single)
      { room_id: getRoom('702', 'UBLE Residences'), tag_detail: 'Private bathroom' },
      { room_id: getRoom('702', 'UBLE Residences'), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('702', 'UBLE Residences'), tag_detail: 'Has wardrobe' },
      // UBLE Residences — 703 (double)
      { room_id: getRoom('703', 'UBLE Residences'), tag_detail: 'Air-conditioned' },
      { room_id: getRoom('703', 'UBLE Residences'), tag_detail: 'Has study desk' },
      // UBLE Residences — 704 (shared)
      { room_id: getRoom('704', 'UBLE Residences'), tag_detail: 'Has study area' },
      { room_id: getRoom('704', 'UBLE Residences'), tag_detail: 'Has locker' },
      // UBLE Residences — 705 (shared)
      { room_id: getRoom('705', 'UBLE Residences'), tag_detail: 'Has study area' },
      { room_id: getRoom('705', 'UBLE Residences'), tag_detail: 'Near elevator' },
    ])

    // =========================================================================
    // 10. APPLICATIONS, ASSIGNMENTS, BOOKMARKS
    // =========================================================================
    await db.table('applications').multiInsert([
      // --- CLARENCE TEST APPLICATIONS ---
      { accommodation_id: getAccom('One Silangan'), student_number: '2024-000002', application_room_type: 'double', application_stay_type: 'transient', application_status: 'approved', duration_of_stay_days: 365, application_date: '2026-04-28 10:00:00', reviewed_at: '2026-04-28 12:30:00', reviewed_by: getUser('slmanuel@up.edu.ph'), approved_at: '2026-04-28 12:30:00', slot_confirm_deadline: '2026-04-30 23:59:59'},
      { accommodation_id: getAccom("White House"), student_number: '2024-000002', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 180, application_date: '2026-04-01 10:00:00', reviewed_at: '2026-04-28 10:00:00', reviewed_by: getUser('slmanuel@up.edu.ph'), approved_at: '2026-04-28 10:00:00', slot_confirm_deadline: '2026-04-28 10:00:00'},
      { accommodation_id: getAccom('One Sapphire Place'), student_number: '2024-000002', application_room_type: 'single', application_stay_type: 'transient', application_status: 'rejected', rejection_reason: 'Incomplete requirements – missing proof of enrollment', duration_of_stay_days: 10, application_date: '2026-02-10 11:00:00', reviewed_at: '2026-02-12 09:15:00', reviewed_by: getUser('aralvarez@gmail.com') },
      { accommodation_id: getAccom("Scholar's Dorm"), student_number: '2024-000002', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'waitlisted', duration_of_stay_days: 180, application_date: '2026-02-15 09:30:00', reviewed_at: '2026-02-18 16:00:00', reviewed_by: getUser('vepadilla@gmail.com') },
      { accommodation_id: getAccom("ATI"), student_number: '2024-000002', application_room_type: 'shared', application_stay_type: 'non_transient', application_status: 'under_review', duration_of_stay_days: 30, application_date: '2026-02-20 14:00:00', reviewed_at: null, reviewed_by: null },
      { accommodation_id: getAccom('White House'), student_number: '2023-223456', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'pending', duration_of_stay_days: 180, application_date: '2026-04-29 08:00:00' },
      { accommodation_id: getAccom('White House'), student_number: '2023-223457', application_room_type: 'double', application_stay_type: 'non_transient', application_status: 'waitlisted', duration_of_stay_days: 365, application_date: '2026-04-29 09:30:00' },
      { accommodation_id: getAccom('UBLE Residences'), student_number: '2023-123458', application_room_type: 'shared', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 365, application_date: '2026-04-28 10:00:00', reviewed_at: '2026-04-28 12:30:00', reviewed_by: getUser('uble.ics.uplb@gmail.com'), approved_at: '2026-04-28 12:30:00', slot_confirm_deadline: '2026-05-05 23:59:59'},
      { accommodation_id: getAccom('UBLE Residences'), student_number: '2023-123461', application_room_type: 'double', application_stay_type: 'non_transient', application_status: 'under_review', duration_of_stay_days: 180, application_date: '2026-04-30 08:00:00' },
      { accommodation_id: getAccom('UBLE Residences'), student_number: '2023-123462', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'waitlisted', duration_of_stay_days: 180, application_date: '2026-04-25 09:30:00', reviewed_at: '2026-04-26 10:00:00', reviewed_by: getUser('uble.ics.uplb@gmail.com') },

      { accommodation_id: getAccom('White House'), student_number: '2023-123457', application_room_type: 'double', application_stay_type: 'non_transient', application_status: 'cancelled', duration_of_stay_days: 150 },
      { accommodation_id: getAccom('White House'), student_number: '2023-123456', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'cancelled', duration_of_stay_days: 180 },
      { accommodation_id: getAccom('One Sapphire Place'), student_number: '2023-123456', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 365 },
      { accommodation_id: getAccom("Scholar's Dorm"), student_number: '2023-123456', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'cancelled', duration_of_stay_days: 120 },
      { accommodation_id: getAccom('One Silangan'), student_number: '2023-123457', application_room_type: 'double', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 365 },
      { accommodation_id: getAccom('One Sapphire Place'), student_number: '2023-123457', application_room_type: 'single', application_stay_type: 'transient', application_status: 'pending', duration_of_stay_days: 10 },
      { accommodation_id: getAccom("ATI"), student_number: '2023-123458', application_room_type: 'shared', application_stay_type: 'transient', application_status: 'under_review', duration_of_stay_days: 30 },
      { accommodation_id: getAccom("Scholar's Dorm"), student_number: '2023-123458', application_room_type: 'shared', application_stay_type: 'non_transient', application_status: 'pending', duration_of_stay_days: 180 },
      { accommodation_id: getAccom("ATI"), student_number: '2023-123459', application_room_type: 'shared', application_stay_type: 'non_transient', application_status: 'cancelled', duration_of_stay_days: 200 },
      { accommodation_id: getAccom('White House'), student_number: '2023-123459', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 365 },
      { accommodation_id: getAccom("Men's Dorm"), student_number: '2023-123460', application_room_type: 'shared', application_stay_type: 'transient', application_status: 'waitlisted', duration_of_stay_days: 15 },
      { accommodation_id: getAccom('One Silangan'), student_number: '2023-123460', application_room_type: 'double', application_stay_type: 'transient', application_status: 'under_review', duration_of_stay_days: 60 },
      { accommodation_id: getAccom('White House'), student_number: '2023-123461', application_room_type: 'double', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 150 },
      { accommodation_id: getAccom("ATI"), student_number: '2023-123461', application_room_type: 'shared', application_stay_type: 'non_transient', application_status: 'cancelled', duration_of_stay_days: 200 },
      { accommodation_id: getAccom('One Sapphire Place'), student_number: '2023-123462', application_room_type: 'single', application_stay_type: 'transient', application_status: 'pending', duration_of_stay_days: 45 },
      { accommodation_id: getAccom("ATI"), student_number: '2023-123462', application_room_type: 'shared', application_stay_type: 'transient', application_status: 'approved', duration_of_stay_days: 90 }
    ])

    await db.table('assignments').multiInsert([
      { student_number: '2023-123456', room_id: getRoom('203', 'One Silangan'), confirmed_date: '2026-02-20', move_in: '2026-03-01', expected_move_out: '2027-03-01', actual_move_out: null, grace_period_days: 5 },
      { student_number: '2023-123457', room_id: getRoom('202', 'One Silangan'), confirmed_date: '2026-02-10', move_in: '2026-02-15', expected_move_out: '2027-02-15', actual_move_out: '2027-02-15', grace_period_days: 5 },
      { student_number: '2023-123459', room_id: getRoom('101', 'White House'), confirmed_date: '2026-01-05', move_in: '2026-01-10', expected_move_out: '2027-01-10', actual_move_out: null, grace_period_days: 5 },
      { student_number: '2023-123461', room_id: getRoom('102', 'White House'), confirmed_date: '2026-03-01', move_in: '2026-03-05', expected_move_out: '2026-08-05', actual_move_out: null, grace_period_days: 5 },
      { student_number: '2023-123462', room_id: getRoom('301', "Men's Dorm"), confirmed_date: '2026-03-08', move_in: '2026-03-10', expected_move_out: '2026-06-10', actual_move_out: null, grace_period_days: 5 },
      // UBLE Residences assignments
      { student_number: '2023-123458', room_id: getRoom('701', 'UBLE Residences'), confirmed_date: '2026-03-01', move_in: '2026-03-05', expected_move_out: '2027-03-05', actual_move_out: null, grace_period_days: 5 },
      { student_number: '2023-123460', room_id: getRoom('702', 'UBLE Residences'), confirmed_date: '2026-03-01', move_in: '2026-03-05', expected_move_out: '2027-03-05', actual_move_out: null, grace_period_days: 5 },
      { student_number: '2023-223456', room_id: getRoom('703', 'UBLE Residences'), confirmed_date: '2026-03-01', move_in: '2026-03-05', expected_move_out: '2027-03-05', actual_move_out: null, grace_period_days: 5 },
    ])

    await db.table('bookmarks').multiInsert([
      { student_number: '2023-123456', accommodation_id: getAccom('White House') },
      { student_number: '2023-123456', accommodation_id: getAccom("Scholar's Dorm") },
      { student_number: '2023-123457', accommodation_id: getAccom('One Silangan') },
      { student_number: '2023-123457', accommodation_id: getAccom('One Sapphire Place') },
      { student_number: '2023-123458', accommodation_id: getAccom('White House') },
      { student_number: '2023-123458', accommodation_id: getAccom("Scholar's Dorm") },
      { student_number: '2023-123459', accommodation_id: getAccom('One Silangan') },
      { student_number: '2023-123460', accommodation_id: getAccom("Men's Dorm") },
      { student_number: '2023-123461', accommodation_id: getAccom('One Silangan') },
      { student_number: '2023-123462', accommodation_id: getAccom("ATI") }
    ])

    // =========================================================================
    // 11. FEES AND PAYMENTS
    // =========================================================================
    // Using getUser directly for Landlord IDs again!
    await db.table('fees').multiInsert([
      { landlord_id: getUser('ntramos@gmail.com'), student_number: '2023-123456', due_date: '2026-04-30', fee_category: 'rent', fee_amount: 6200.00, fee_balance: 6200.00, fee_status: 'unpaid' },
      { landlord_id: getUser('cmnavarro@gmail.com'), student_number: '2023-123457', due_date: '2026-04-30', fee_category: 'utilities', fee_amount: 1200.00, fee_balance: 0.00, fee_status: 'paid' },
      { landlord_id: getUser('larkinsanchez@gmail.com'), student_number: '2023-123459', due_date: '2026-04-30', fee_category: 'rent', fee_amount: 5000.00, fee_balance: 0.00, fee_status: 'paid' },
      { landlord_id: getUser('larkinsanchez@gmail.com'), student_number: '2023-123461', due_date: '2026-04-30', fee_category: 'miscellaneous', fee_amount: 800.00, fee_balance: 400.00, fee_status: 'partial' },
      { landlord_id: getUser('raortega@gmail.com'), student_number: '2023-123462', due_date: '2026-03-31', fee_category: 'rent', fee_amount: 800.00, fee_balance: 800.00, fee_status: 'overdue' },
      // UBLE fees
      { landlord_id: getUser('uble.ics.uplb@gmail.com'), student_number: '2023-123458', due_date: '2026-03-01', fee_category: 'rent', fee_amount: 5500.00, fee_balance: 5500.00, fee_status: 'overdue' },
      { landlord_id: getUser('uble.ics.uplb@gmail.com'), student_number: '2023-123460', due_date: '2026-03-01', fee_category: 'rent', fee_amount: 5500.00, fee_balance: 0.00, fee_status: 'paid' },
    ])

    const allFees = await db.from('fees').select('id', 'student_number', 'fee_category')
    const getFee = (student: string, category: string) => allFees.find(f => f.student_number === student && f.fee_category === category)?.id

    await db.table('payments').multiInsert([
      { fee_id: getFee('2023-123457', 'utilities'), proof_file_id: getFile('payment_1.jpg'), payment_amount: 1200.00, mode_of_payment: 'GCash' },
      { fee_id: getFee('2023-123459', 'rent'), proof_file_id: getFile('payment_2.jpg'), payment_amount: 5000.00, mode_of_payment: 'Bank Transfer' },
      { fee_id: getFee('2023-123461', 'miscellaneous'), proof_file_id: getFile('payment_3.jpg'), payment_amount: 400.00, mode_of_payment: 'Cash' }
    ])

    // =========================================================================
    // 12. LOGS AND SYSTEM
    // =========================================================================
    // Fetch generic IDs so we don't hardcode log references!
    const dbApps = await db.from('applications').select('id')
    const dbAssigns = await db.from('assignments').select('id')
    const dbFees = await db.from('fees').select('id')
    const dbDocs = await db.from('documents').select('id')

    await db.table('logs').multiInsert([
      { actor_id: getUser('afjuarez@up.edu.ph'), entity_type: 'application', entity_id: dbApps[0]?.id || 1, log_timestamp: '2026-03-01 09:15:00', activity_type: 'create', activity_details: 'Student submitted application for Accommodation 1' },
      { actor_id: getUser('svramirez@up.edu.ph'), entity_type: 'assignment', entity_id: dbAssigns[0]?.id || 1, log_timestamp: '2026-03-01 10:00:00', activity_type: 'assign', activity_details: 'Student assigned to Room 101 in Accommodation 1' },
      { actor_id: getUser('djsantos@up.edu.ph'), entity_type: 'fee', entity_id: dbFees[0]?.id || 1, log_timestamp: '2026-03-02 14:20:00', activity_type: 'create', activity_details: 'Landlord issued rent fee for student 2023123456' },
      { actor_id: getUser('kjvillanueva@up.edu.ph'), entity_type: 'accommodation', entity_id: getAccom('White House'), log_timestamp: '2026-03-02 16:35:00', activity_type: 'update', activity_details: 'Updated capacity of Accommodation 1' },
      { actor_id: getUser('accruz@up.edu.ph'), entity_type: 'document', entity_id: dbDocs[0]?.id || 1, log_timestamp: '2026-03-03 11:45:00', activity_type: 'upload', activity_details: 'Student uploaded enrollment proof' },
      { actor_id: getUser('jdaguilar@up.edu.ph'), entity_type: 'room', entity_id: getRoom('101', 'White House'), log_timestamp: '2026-03-03 13:00:00', activity_type: 'maintenance', activity_details: 'Room 101 set to maintenance mode' },
      { actor_id: getUser('afjuarez@up.edu.ph'), entity_type: 'application', entity_id: dbApps[1]?.id || 2, log_timestamp: '2026-03-04 08:20:00', activity_type: 'approve', activity_details: 'Application for Accommodation 2 approved' },
      { actor_id: getUser('svramirez@up.edu.ph'), entity_type: 'assignment', entity_id: dbAssigns[1]?.id || 2, log_timestamp: '2026-03-04 09:00:00', activity_type: 'move_in', activity_details: 'Student moved into Room 102' },
      { actor_id: getUser('djsantos@up.edu.ph'), entity_type: 'fee', entity_id: dbFees[1]?.id || 2, log_timestamp: '2026-03-05 15:10:00', activity_type: 'payment', activity_details: 'Student 2023123457 partially paid utilities fee' },
      { actor_id: getUser('kjvillanueva@up.edu.ph'), entity_type: 'accommodation', entity_id: getAccom('One Silangan'), log_timestamp: '2026-03-05 16:30:00', activity_type: 'update', activity_details: 'Changed accommodation type to coed' }
    ])

    await db.table('notifications').multiInsert([
      // --- CLARENCE TEST NOTIFICATIONS ---
      { user_id: getUser('ctbernardino@up.edu.ph'), notification_content: 'Your rent payment for One Silangan is due on March 15, 2026.', read_status: 'unread', notification_type: 'fee_due' },
      { user_id: getUser('ctbernardino@up.edu.ph'), notification_content: 'Your accommodation application to One Silangan has been approved.', read_status: 'unread', notification_type: 'application_status' },
      { user_id: getUser('ctbernardino@up.edu.ph'), notification_content: 'Welcome to the USAT Platform!', read_status: 'read', notification_type: 'system' },
      
      { user_id: getUser('accruz@up.edu.ph'), notification_content: 'Your accommodation application has been approved.', read_status: 'read', notification_type: 'application_status' },
      { user_id: getUser('svramirez@up.edu.ph'), notification_content: 'System maintenance is scheduled on March 12, 2026.', read_status: 'unread', notification_type: 'system' },
      { user_id: getUser('kjvillanueva@up.edu.ph'), notification_content: 'Please update your profile information.', read_status: 'read', notification_type: 'other' },
      { user_id: getUser('jdaguilar@up.edu.ph'), notification_content: 'Your utility fee is due tomorrow.', read_status: 'unread', notification_type: 'fee_due' }
    ])

    await db.table('sys_variables').multiInsert([
      { current_semester: 'first_sem', current_sy: '2024-2025', sem_start_date: '2024-08-20', uplb_latitude: 14.1651, uplb_longitude: 121.2402 },
      { current_semester: 'second_sem', current_sy: '2024-2025', sem_start_date: '2025-01-13', uplb_latitude: 14.1651, uplb_longitude: 121.2402 },
      { current_semester: 'midyear', current_sy: '2024-2025', sem_start_date: '2025-06-10', uplb_latitude: 14.1651, uplb_longitude: 121.2402 },
      { current_semester: 'first_sem', current_sy: '2025-2026', sem_start_date: '2025-08-19', uplb_latitude: 14.1651, uplb_longitude: 121.2402 },
      { current_semester: 'second_sem', current_sy: '2025-2026', sem_start_date: '2026-01-12', uplb_latitude: 14.1651, uplb_longitude: 121.2402 }
    ])
  }
}