import db from '@adonisjs/lucid/services/db'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

async function insertMissing<T extends Record<string, any>>(
  table: string,
  rows: T[],
  uniqueColumn: keyof T & string
) {
  if (rows.length === 0) return
  const existing = new Set(
    (await db.from(table).select(uniqueColumn)).map((r: any) => r[uniqueColumn])
  )
  const toInsert = rows.filter((r) => !existing.has(r[uniqueColumn]))
  if (toInsert.length) await db.table(table).multiInsert(toInsert)
}

export default class FilesAndUsersSeeder extends BaseSeeder {
  async run() {
    // ── FILE METADATA ──────────────────────────────────────────────────────
    const fileRows = [
      // Profile Images
      ...Array.from({ length: 19 }, (_, i) => ({
        file_name: `pfp_${i + 1}.jpg`,
        file_path: `/uploads/images/pfp_${i + 1}.jpg`,
        file_type: 'image',
      })),
      // Enrollment Proofs
      { file_name: 'enroll_2023123456.pdf', file_path: '/uploads/documents/enroll_2023123456.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123457.pdf', file_path: '/uploads/documents/enroll_2023123457.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123458.pdf', file_path: '/uploads/documents/enroll_2023123458.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123459.pdf', file_path: '/uploads/documents/enroll_2023123459.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123460.pdf', file_path: '/uploads/documents/enroll_2023123460.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123461.pdf', file_path: '/uploads/documents/enroll_2023123461.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123462.pdf', file_path: '/uploads/documents/enroll_2023123462.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123463b.pdf', file_path: '/uploads/documents/enroll_2023123463b.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123463.pdf', file_path: '/uploads/documents/enroll_2023123463.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123464.pdf', file_path: '/uploads/documents/enroll_2023123464.pdf', file_type: 'document' },
      { file_name: 'enroll_2023123465.pdf', file_path: '/uploads/documents/enroll_202300000.pdf', file_type: 'document' },
      // Reports
      ...Array.from({ length: 6 }, (_, i) => ({
        file_name: `report_${i + 1}.pdf`,
        file_path: `/uploads/documents/report_${i + 1}.pdf`,
        file_type: 'document',
      })),
      // Business Permits
      ...Array.from({ length: 6 }, (_, i) => ({
        file_name: `business_permit_${i + 1}.pdf`,
        file_path: `/uploads/documents/business_permit_${i + 1}.pdf`,
        file_type: 'document',
      })),
      // Accommodation Images
      ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
        { file_name: `accom${n}_img1.jpg`, file_path: `/uploads/images/accom${n}_img1.jpg`, file_type: 'image' },
        { file_name: `accom${n}_img2.jpg`, file_path: `/uploads/images/accom${n}_img2.jpg`, file_type: 'image' },
      ]),
      // Payments
      ...Array.from({ length: 4 }, (_, i) => ({
        file_name: `payment_${i + 1}.jpg`,
        file_path: `/uploads/images/payment_${i + 1}.jpg`,
        file_type: 'image',
      })),
      // Other Docs
      ...Array.from({ length: 5 }, (_, i) => ({
        file_name: `doc_img_${i + 1}.jpg`,
        file_path: `/uploads/documents/doc_${i + 1}.pdf`,
        file_type: 'document',
      })),
    ]
    await insertMissing('file_metadata', fileRows, 'file_name')

    const allFiles = await db.from('file_metadata').select('id', 'file_name')
    const getFile = (name: string) => allFiles.find((f) => f.file_name === name)?.id

    // ── USERS ──────────────────────────────────────────────────────────────
    const userRows = [
      // Students
      { pfp_file_id: getFile('pfp_1.jpg'), fname: 'Louise Natasha', mname: 'Valeria', lname: 'Martinez', suffix: null, email: 'lvmartinez@up.edu.ph', facebook_account: 'facebook.com/luna.valeria', role: 'student' },
      { pfp_file_id: getFile('pfp_2.jpg'), fname: 'Avrielle Haven', mname: 'Fernandez', lname: 'Juarez', suffix: null, email: 'afjuarez@up.edu.ph', facebook_account: 'facebook.com/avie.juarez', role: 'student' },
      { pfp_file_id: getFile('pfp_3.jpg'), fname: 'Samantha Maureen', mname: 'Vera', lname: 'Ramirez', suffix: null, email: 'svramirez@up.edu.ph', facebook_account: 'facebook.com/sam.ramirez', role: 'student' },
      { pfp_file_id: getFile('pfp_4.jpg'), fname: 'Avianna Rye', mname: 'Castillo', lname: 'Cruz', suffix: null, email: 'accruz@up.edu.ph', facebook_account: 'facebook.com/via.cruz', role: 'student' },
      { pfp_file_id: getFile('pfp_5.jpg'), fname: 'Daniel Joseph', mname: 'Flores', lname: 'Santos', suffix: null, email: 'djsantos@up.edu.ph', facebook_account: 'facebook.com/daniel.santos', role: 'student' },
      { pfp_file_id: getFile('pfp_6.jpg'), fname: 'Kristine Joy', mname: 'Mendoza', lname: 'Villanueva', suffix: null, email: 'kjvillanueva@up.edu.ph', facebook_account: 'facebook.com/kristine.villanueva', role: 'student' },
      { pfp_file_id: getFile('pfp_7.jpg'), fname: 'Joshua Daniel', mname: 'Castro', lname: 'Aguilar', suffix: null, email: 'jdaguilar@up.edu.ph', facebook_account: 'facebook.com/joshua.aguilar', role: 'student' },
      { pfp_file_id: getFile('pfp_3.jpg'), fname: 'Maria Victoria', mname: 'Reyes', lname: 'Santos', suffix: null, email: 'mvreyes8@up.edu.ph', facebook_account: 'facebook.com/mv.reyes', role: 'student' },
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
      { pfp_file_id: getFile('pfp_1.jpg'), fname: 'Mimi', mname: null, lname: 'Yu', suffix: null, email: 'yuuhhhmimi@gmail.com', facebook_account: 'facebook.com/yuuhhhmimi', role: 'manager' },
      // Pending / unassigned
      { pfp_file_id: getFile('pfp_1.jpg'), fname: 'Ana Marie', mname: null, lname: 'Reyes', suffix: null, email: 'pending.student1@up.edu.ph', facebook_account: 'facebook.com/ana.reyes', role: 'unassigned' },
      { pfp_file_id: getFile('pfp_2.jpg'), fname: 'John Paul', mname: null, lname: 'Santos', suffix: null, email: 'pending.student2@up.edu.ph', facebook_account: 'facebook.com/john.santos', role: 'unassigned' },
      { pfp_file_id: getFile('pfp_8.jpg'), fname: 'Carla', mname: null, lname: 'Navarro', suffix: null, email: 'pending.landlord1@gmail.com', facebook_account: 'facebook.com/carla.navarro', role: 'unassigned' },
    ]
    await insertMissing('users', userRows, 'email')

    const allUsers = await db.from('users').select('id', 'email')
    const getUser = (email: string) => allUsers.find((u) => u.email === email)?.id

    // ── PHONE NUMBERS ──────────────────────────────────────────────────────
    const phoneRows = [
      { user_id: getUser('lvmartinez@up.edu.ph'), contact_number: '09171234567', is_primary: true },
      { user_id: getUser('afjuarez@up.edu.ph'), contact_number: '09625494265', is_primary: true },
      { user_id: getUser('svramirez@up.edu.ph'), contact_number: '09123456789', is_primary: true },
      { user_id: getUser('accruz@up.edu.ph'), contact_number: '09175678321', is_primary: true },
      { user_id: getUser('mvreyes8@up.edu.ph'), contact_number: '09171234568', is_primary: true },
      { user_id: getUser('yuuhhhmimi@gmail.com'), contact_number: '09171234569', is_primary: true },
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
    ]
    await insertMissing('phone_numbers', phoneRows, 'contact_number')

    // ── LANDLORDS / MANAGERS / STUDENTS (keyed on user_id) ─────────────────
    const landlordRows = [
      { user_id: getUser('larkinsanchez@gmail.com'), tin: '123-456-789-000' },
      { user_id: getUser('cmnavarro@gmail.com'), tin: '234-567-890-111' },
      { user_id: getUser('pagarcia@up.edu.ph'), tin: '345-678-901-222' },
      { user_id: getUser('raortega@gmail.com'), tin: '456-789-012-333' },
      { user_id: getUser('ntramos@gmail.com'), tin: '567-890-123-444' },
      { user_id: getUser('pending.landlord1@gmail.com'), tin: '678-901-234-555' },
    ]
    await insertMissing('landlords', landlordRows, 'user_id')

    const managerRows = [
      { user_id: getUser('juan.delacruz@gmail.com'), manager_status: 'active' },
      { user_id: getUser('slmanuel@up.edu.ph'), manager_status: 'active' },
      { user_id: getUser('mabautista@gmail.com'), manager_status: 'active' },
      { user_id: getUser('ampineda@up.edu.ph'), manager_status: 'inactive' },
      { user_id: getUser('vepadilla@gmail.com'), manager_status: 'active' },
      { user_id: getUser('aralvarez@gmail.com'), manager_status: 'active' },
      { user_id: getUser('yuuhhhmimi@gmail.com'), manager_status: 'active' },
    ]
    await insertMissing('managers', managerRows, 'user_id')

    const studentRows = [
      { student_number: '2023-123456', user_id: getUser('lvmartinez@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123456.pdf'), college: 'CEAT', degree_program: 'BS Industrial Engineering', gender: 'Female', emergency_contact_name: 'Kalix Martinez', emergency_contact_number: '09181234567', year_level: '3rd Year' },
      { student_number: '2023-123457', user_id: getUser('afjuarez@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123457.pdf'), college: 'CEAT', degree_program: 'BS Civil Engineering', gender: 'Female', emergency_contact_name: 'Sebastian Cameroz', emergency_contact_number: '09999159295', year_level: '2nd Year' },
      { student_number: '2023-123458', user_id: getUser('svramirez@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123458.pdf'), college: 'CEM', degree_program: 'BS Economics', gender: 'Female', emergency_contact_name: 'Ashianna Fernandez', emergency_contact_number: '09293230856', year_level: '4th Year' },
      { student_number: '2023-123459', user_id: getUser('accruz@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123459.pdf'), college: 'CAS', degree_program: 'BA Communication Arts', gender: 'Female', emergency_contact_name: 'Clyden Ramirez', emergency_contact_number: '09876543210', year_level: '1st Year' },
      { student_number: '2023-123460', user_id: getUser('djsantos@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123460.pdf'), college: 'CEAT', degree_program: 'BS Industrial Engineering', gender: 'Male', emergency_contact_name: null, emergency_contact_number: null, year_level: '2nd Year' },
      { student_number: '2023-123461', user_id: getUser('kjvillanueva@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123461.pdf'), college: 'CBA', degree_program: 'BS Accountancy', gender: 'Female', emergency_contact_name: 'Rafael Ortega', emergency_contact_number: '09172345678', year_level: '5th Year' },
      { student_number: '2023-123462', user_id: getUser('jdaguilar@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123462.pdf'), college: 'CITE', degree_program: 'BS Computer Science', gender: 'Male', emergency_contact_name: 'Victor Padilla', emergency_contact_number: '09987654321', year_level: '3rd Year' },
      { student_number: '2023-123463', user_id: getUser('mvreyes8@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123463b.pdf'), college: 'CAS', degree_program: 'BS Biology', gender: 'Female', emergency_contact_name: null, emergency_contact_number: null, year_level: '2nd Year' },
      { student_number: '2023-223456', user_id: getUser('pending.student1@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123463.pdf'), college: 'CAS', degree_program: 'BS Biology', gender: 'Female', emergency_contact_name: 'Maria Reyes', emergency_contact_number: '09171234567', year_level: '1st Year' },
      { student_number: '2023-223457', user_id: getUser('pending.student2@up.edu.ph'), enrollment_proof_file_id: getFile('enroll_2023123464.pdf'), college: 'CEM', degree_program: 'BS Economics', gender: 'Male', emergency_contact_name: 'Pedro Santos', emergency_contact_number: '09181234567', year_level: '4th Year' },
    ]
    await insertMissing('students', studentRows, 'student_number')
  }
}
