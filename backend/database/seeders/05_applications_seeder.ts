import db from '@adonisjs/lucid/services/db'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

async function isTableEmpty(table: string): Promise<boolean> {
  const result = await db.from(table).count('* as c')
  return Number(result[0].c) === 0
}

export default class ApplicationsSeeder extends BaseSeeder {
  async run() {
    const allFiles = await db.from('file_metadata').select('id', 'file_name')
    const getFile = (name: string) => allFiles.find((f) => f.file_name === name)?.id
    const allUsers = await db.from('users').select('id', 'email')
    const getUser = (email: string) => allUsers.find((u) => u.email === email)?.id
    const allAccoms = await db.from('accommodations').select('id', 'accommodation_name')
    const getAccom = (name: string) => allAccoms.find((a) => a.accommodation_name === name)?.id
    const allRooms = await db.from('rooms').select('id', 'room_number', 'accommodation_id')
    const getRoom = (roomNum: string, accomName: string) =>
      allRooms.find(
        (r) => r.room_number === roomNum && r.accommodation_id === getAccom(accomName)
      )?.id

    // ── DOCUMENTS ──────────────────────────────────────────────────────────
    if (await isTableEmpty('documents')) {
      await db.table('documents').multiInsert([
        { user_id: getUser('afjuarez@up.edu.ph'), file_id: getFile('doc_img_1.jpg'), upload_timestamp: '2026-03-01 09:15:00' },
        { user_id: getUser('svramirez@up.edu.ph'), file_id: getFile('doc_img_2.jpg'), upload_timestamp: '2026-03-02 14:30:00' },
        { user_id: getUser('accruz@up.edu.ph'), file_id: getFile('doc_img_3.jpg'), upload_timestamp: '2026-03-03 11:45:00' },
        { user_id: getUser('djsantos@up.edu.ph'), file_id: getFile('doc_img_4.jpg'), upload_timestamp: '2026-03-04 16:20:00' },
        { user_id: getUser('kjvillanueva@up.edu.ph'), file_id: getFile('doc_img_5.jpg'), upload_timestamp: '2026-03-05 08:05:00' },
      ])
    }

    // ── REPORTS ────────────────────────────────────────────────────────────
    if (await isTableEmpty('reports')) {
      await db.table('reports').multiInsert([
        { landlord_id: getUser('ntramos@gmail.com'), student_number: '2023-123456', report_file_id: getFile('report_1.pdf'), report_type: 'billing' },
        { landlord_id: getUser('cmnavarro@gmail.com'), student_number: '2023-123457', report_file_id: getFile('report_2.pdf'), report_type: 'assignment' },
        { landlord_id: getUser('larkinsanchez@gmail.com'), student_number: '2023-123459', report_file_id: getFile('report_3.pdf'), report_type: 'billing' },
        { landlord_id: getUser('larkinsanchez@gmail.com'), student_number: '2023-123461', report_file_id: getFile('report_4.pdf'), report_type: 'assignment' },
      ])
    }

    // ── APPLICATIONS ───────────────────────────────────────────────────────
    if (await isTableEmpty('applications')) {
      await db.table('applications').multiInsert([
        { accommodation_id: getAccom('One Silangan'), student_number: '2023-123457', application_room_type: 'double', application_stay_type: 'transient', application_status: 'approved', duration_of_stay_days: 365, application_date: '2026-04-28 10:00:00', reviewed_at: '2026-04-28 12:30:00', reviewed_by: getUser('slmanuel@up.edu.ph'), approved_at: '2026-04-28 12:30:00', slot_confirm_deadline: '2026-04-30 23:59:59', room_id: getRoom('202', 'One Silangan'), move_in_date: '2026-05-01', move_out_date: '2027-05-01', reservation_fee: 1400.0, move_in_fee: 21000.0 },
        { accommodation_id: getAccom('White House'), student_number: '2023-123457', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 180, application_date: '2026-04-01 10:00:00', reviewed_at: '2026-04-28 10:00:00', reviewed_by: getUser('slmanuel@up.edu.ph'), approved_at: '2026-04-28 10:00:00', slot_confirm_deadline: '2026-04-28 10:00:00', room_id: getRoom('101', 'White House'), move_in_date: '2026-05-01', move_out_date: '2026-10-28', reservation_fee: 1000.0, move_in_fee: 10000.0 },
        { accommodation_id: getAccom('One Sapphire Place'), student_number: '2023-123457', application_room_type: 'single', application_stay_type: 'transient', application_status: 'rejected', rejection_reason: 'Incomplete requirements – missing proof of enrollment', duration_of_stay_days: 10, application_date: '2026-02-10 11:00:00', reviewed_at: '2026-02-12 09:15:00', reviewed_by: getUser('aralvarez@gmail.com'), room_id: getRoom('601', 'One Sapphire Place'), move_in_date: '2026-02-20', move_out_date: '2026-03-02', reservation_fee: 1000.0, move_in_fee: 9000.0 },
        { accommodation_id: getAccom("Scholar's Dorm"), student_number: '2023-123457', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'waitlisted', duration_of_stay_days: 180, application_date: '2026-02-15 09:30:00', reviewed_at: '2026-02-18 16:00:00', reviewed_by: getUser('vepadilla@gmail.com'), room_id: getRoom('501', "Scholar's Dorm"), move_in_date: '2026-03-01', move_out_date: '2026-08-28', reservation_fee: 1375.0, move_in_fee: 11000.0 },
        { accommodation_id: getAccom('ATI'), student_number: '2023-123457', application_room_type: 'shared', application_stay_type: 'non_transient', application_status: 'under_review', duration_of_stay_days: 30, application_date: '2026-02-20 14:00:00', reviewed_at: null, reviewed_by: null, room_id: getRoom('402', 'ATI'), move_in_date: '2026-03-05', move_out_date: '2026-04-04', reservation_fee: 500.0, move_in_fee: 800.0 },
        { accommodation_id: getAccom('White House'), student_number: '2023-223456', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'pending', duration_of_stay_days: 180, application_date: '2026-04-29 08:00:00' },
        { accommodation_id: getAccom('White House'), student_number: '2023-223457', application_room_type: 'double', application_stay_type: 'non_transient', application_status: 'waitlisted', duration_of_stay_days: 365, application_date: '2026-04-29 09:30:00' },
        { accommodation_id: getAccom('White House'), student_number: '2023-123457', application_room_type: 'double', application_stay_type: 'non_transient', application_status: 'cancelled', duration_of_stay_days: 150, room_id: getRoom('102', 'White House'), move_in_date: null, move_out_date: null, reservation_fee: null, move_in_fee: null },
        { accommodation_id: getAccom('White House'), student_number: '2023-123456', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'cancelled', duration_of_stay_days: 180, room_id: getRoom('101', 'White House'), move_in_date: null, move_out_date: null, reservation_fee: null, move_in_fee: null },
        { accommodation_id: getAccom('One Sapphire Place'), student_number: '2023-123456', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 365, room_id: getRoom('601', 'One Sapphire Place'), move_in_date: '2026-03-01', move_out_date: '2027-03-01', reservation_fee: 1000.0, move_in_fee: 9000.0 },
        { accommodation_id: getAccom("Scholar's Dorm"), student_number: '2023-123456', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'cancelled', duration_of_stay_days: 120, room_id: getRoom('501', "Scholar's Dorm"), move_in_date: null, move_out_date: null, reservation_fee: null, move_in_fee: null },
        { accommodation_id: getAccom('One Silangan'), student_number: '2023-123457', application_room_type: 'double', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 365, room_id: getRoom('202', 'One Silangan'), move_in_date: '2026-02-15', move_out_date: '2027-02-15', reservation_fee: 1400.0, move_in_fee: 21000.0 },
        { accommodation_id: getAccom('One Sapphire Place'), student_number: '2023-123457', application_room_type: 'single', application_stay_type: 'transient', application_status: 'pending', duration_of_stay_days: 10, room_id: getRoom('601', 'One Sapphire Place'), move_in_date: '2026-04-01', move_out_date: '2026-04-11', reservation_fee: 1000.0, move_in_fee: 9000.0 },
        { accommodation_id: getAccom('ATI'), student_number: '2023-123458', application_room_type: 'shared', application_stay_type: 'transient', application_status: 'under_review', duration_of_stay_days: 30, room_id: getRoom('402', 'ATI'), move_in_date: '2026-04-05', move_out_date: '2026-05-05', reservation_fee: 500.0, move_in_fee: 800.0 },
        { accommodation_id: getAccom("Scholar's Dorm"), student_number: '2023-123458', application_room_type: 'shared', application_stay_type: 'non_transient', application_status: 'pending', duration_of_stay_days: 180, room_id: getRoom('502', "Scholar's Dorm"), move_in_date: '2026-04-15', move_out_date: '2026-10-12', reservation_fee: 1500.0, move_in_fee: 12000.0 },
        { accommodation_id: getAccom('ATI'), student_number: '2023-123459', application_room_type: 'shared', application_stay_type: 'non_transient', application_status: 'cancelled', duration_of_stay_days: 200, room_id: getRoom('402', 'ATI'), move_in_date: null, move_out_date: null, reservation_fee: null, move_in_fee: null },
        { accommodation_id: getAccom('White House'), student_number: '2023-123459', application_room_type: 'single', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 365, room_id: getRoom('101', 'White House'), move_in_date: '2026-01-10', move_out_date: '2027-01-10', reservation_fee: 1000.0, move_in_fee: 10000.0 },
        { accommodation_id: getAccom("Men's Dorm"), student_number: '2023-123460', application_room_type: 'shared', application_stay_type: 'transient', application_status: 'waitlisted', duration_of_stay_days: 15, room_id: getRoom('302', "Men's Dorm"), move_in_date: '2026-03-20', move_out_date: '2026-04-04', reservation_fee: 500.0, move_in_fee: 800.0 },
        { accommodation_id: getAccom('One Silangan'), student_number: '2023-123460', application_room_type: 'double', application_stay_type: 'transient', application_status: 'under_review', duration_of_stay_days: 60, room_id: getRoom('202', 'One Silangan'), move_in_date: '2026-04-01', move_out_date: '2026-05-31', reservation_fee: 1400.0, move_in_fee: 21000.0 },
        { accommodation_id: getAccom('White House'), student_number: '2023-123461', application_room_type: 'double', application_stay_type: 'non_transient', application_status: 'approved', duration_of_stay_days: 150, room_id: getRoom('102', 'White House'), move_in_date: '2026-03-05', move_out_date: '2026-08-05', reservation_fee: 1500.0, move_in_fee: 13000.0 },
        { accommodation_id: getAccom('ATI'), student_number: '2023-123461', application_room_type: 'shared', application_stay_type: 'non_transient', application_status: 'cancelled', duration_of_stay_days: 200, room_id: getRoom('401', 'ATI'), move_in_date: null, move_out_date: null, reservation_fee: null, move_in_fee: null },
        { accommodation_id: getAccom('One Sapphire Place'), student_number: '2023-123457', application_room_type: 'single', application_stay_type: 'transient', application_status: 'pending', duration_of_stay_days: 45, room_id: getRoom('601', 'One Sapphire Place'), move_in_date: '2026-04-10', move_out_date: '2026-05-25', reservation_fee: 1000.0, move_in_fee: 9000.0 },
        { accommodation_id: getAccom('ATI'), student_number: '2023-123457', application_room_type: 'shared', application_stay_type: 'transient', application_status: 'approved', duration_of_stay_days: 90, room_id: getRoom('401', 'ATI'), move_in_date: '2026-03-10', move_out_date: '2026-06-08', reservation_fee: 500.0, move_in_fee: 800.0 },
      ])
    }

    // ── ASSIGNMENTS ────────────────────────────────────────────────────────
    if (await isTableEmpty('assignments')) {
      await db.table('assignments').multiInsert([
        { student_number: '2023-123456', room_id: getRoom('203', 'One Silangan'), confirmed_date: '2026-02-20', move_in: '2026-03-01', expected_move_out: '2027-03-01', actual_move_out: null, grace_period_days: 5 },
        { student_number: '2023-123457', room_id: getRoom('202', 'One Silangan'), confirmed_date: '2026-02-10', move_in: '2026-02-15', expected_move_out: '2027-02-15', actual_move_out: '2027-02-15', grace_period_days: 5 },
        { student_number: '2023-123459', room_id: getRoom('101', 'White House'), confirmed_date: '2026-01-05', move_in: '2026-01-10', expected_move_out: '2027-01-10', actual_move_out: null, grace_period_days: 5 },
        { student_number: '2023-123461', room_id: getRoom('102', 'White House'), confirmed_date: '2026-03-01', move_in: '2026-03-05', expected_move_out: '2026-08-05', actual_move_out: null, grace_period_days: 5 },
        { student_number: '2023-123462', room_id: getRoom('301', "Men's Dorm"), confirmed_date: '2026-03-08', move_in: '2026-03-10', expected_move_out: '2026-06-10', actual_move_out: null, grace_period_days: 5 },
      ])
    }

    // ── BOOKMARKS ──────────────────────────────────────────────────────────
    if (await isTableEmpty('bookmarks')) {
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
        { student_number: '2023-123457', accommodation_id: getAccom('ATI') },
      ])
    }

    // ── FEES ───────────────────────────────────────────────────────────────
    if (await isTableEmpty('fees')) {
      await db.table('fees').multiInsert([
        { landlord_id: getUser('ntramos@gmail.com'), student_number: '2023-123456', due_date: '2026-04-30', fee_category: 'rent', fee_amount: 6200.0, fee_balance: 6200.0, fee_status: 'unpaid' },
        { landlord_id: getUser('cmnavarro@gmail.com'), student_number: '2023-123457', due_date: '2026-04-30', fee_category: 'utilities', fee_amount: 1200.0, fee_balance: 0.0, fee_status: 'paid' },
        { landlord_id: getUser('larkinsanchez@gmail.com'), student_number: '2023-123459', due_date: '2026-04-30', fee_category: 'rent', fee_amount: 5000.0, fee_balance: 0.0, fee_status: 'paid' },
        { landlord_id: getUser('larkinsanchez@gmail.com'), student_number: '2023-123461', due_date: '2026-04-30', fee_category: 'miscellaneous', fee_amount: 800.0, fee_balance: 400.0, fee_status: 'partial' },
        { landlord_id: getUser('raortega@gmail.com'), student_number: '2023-123457', due_date: '2026-03-31', fee_category: 'rent', fee_amount: 800.0, fee_balance: 800.0, fee_status: 'overdue' },
      ])
    }

    // ── PAYMENTS ───────────────────────────────────────────────────────────
    if (await isTableEmpty('payments')) {
      const allFees = await db.from('fees').select('id', 'student_number', 'fee_category')
      const getFee = (student: string, category: string) =>
        allFees.find((f) => f.student_number === student && f.fee_category === category)?.id
      await db.table('payments').multiInsert([
        { fee_id: getFee('2023-123457', 'utilities'), proof_file_id: getFile('payment_1.jpg'), payment_amount: 1200.0, mode_of_payment: 'GCash' },
        { fee_id: getFee('2023-123459', 'rent'), proof_file_id: getFile('payment_2.jpg'), payment_amount: 5000.0, mode_of_payment: 'Bank Transfer' },
        { fee_id: getFee('2023-123461', 'miscellaneous'), proof_file_id: getFile('payment_3.jpg'), payment_amount: 400.0, mode_of_payment: 'Cash' },
      ])
    }
  }
}
