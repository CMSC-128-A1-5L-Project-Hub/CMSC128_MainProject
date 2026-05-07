import db from '@adonisjs/lucid/services/db'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

async function isTableEmpty(table: string): Promise<boolean> {
  const result = await db.from(table).count('* as c')
  return Number(result[0].c) === 0
}

export default class MiscSeeder extends BaseSeeder {
  async run() {
    const allUsers = await db.from('users').select('id', 'email')
    const getUser = (email: string) => allUsers.find((u) => u.email === email)?.id
    const allAccoms = await db.from('accommodations').select('id', 'accommodation_name')
    const getAccom = (name: string) => allAccoms.find((a) => a.accommodation_name === name)?.id
    const allRooms = await db.from('rooms').select('id', 'room_number', 'accommodation_id')
    const getRoom = (roomNum: string, accomName: string) =>
      allRooms.find(
        (r) => r.room_number === roomNum && r.accommodation_id === getAccom(accomName)
      )?.id

    // ── LOGS ───────────────────────────────────────────────────────────────
    if (await isTableEmpty('logs')) {
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
        { actor_id: getUser('kjvillanueva@up.edu.ph'), entity_type: 'accommodation', entity_id: getAccom('One Silangan'), log_timestamp: '2026-03-05 16:30:00', activity_type: 'update', activity_details: 'Changed accommodation type to coed' },
      ])
    }

    // ── NOTIFICATIONS ──────────────────────────────────────────────────────
    if (await isTableEmpty('notifications')) {
      await db.table('notifications').multiInsert([
        { user_id: getUser('ctbernardino@up.edu.ph'), notification_content: 'Your rent payment for One Silangan is due on March 15, 2026.', read_status: 'unread', notification_type: 'fee_due' },
        { user_id: getUser('ctbernardino@up.edu.ph'), notification_content: 'Your accommodation application to One Silangan has been approved.', read_status: 'unread', notification_type: 'application_status' },
        { user_id: getUser('ctbernardino@up.edu.ph'), notification_content: 'Welcome to the USAT Platform!', read_status: 'read', notification_type: 'system' },
        { user_id: getUser('accruz@up.edu.ph'), notification_content: 'Your accommodation application has been approved.', read_status: 'read', notification_type: 'application_status' },
        { user_id: getUser('svramirez@up.edu.ph'), notification_content: 'System maintenance is scheduled on March 12, 2026.', read_status: 'unread', notification_type: 'system' },
        { user_id: getUser('kjvillanueva@up.edu.ph'), notification_content: 'Please update your profile information.', read_status: 'read', notification_type: 'other' },
        { user_id: getUser('jdaguilar@up.edu.ph'), notification_content: 'Your utility fee is due tomorrow.', read_status: 'unread', notification_type: 'fee_due' },
      ])
    }

    // ── SYS VARIABLES ──────────────────────────────────────────────────────
    if (await isTableEmpty('sys_variables')) {
      await db.table('sys_variables').multiInsert([
        { current_semester: 'first_sem', current_sy: '2024-2025', sem_start_date: '2024-08-20', uplb_latitude: 14.1651, uplb_longitude: 121.2402 },
        { current_semester: 'second_sem', current_sy: '2024-2025', sem_start_date: '2025-01-13', uplb_latitude: 14.1651, uplb_longitude: 121.2402 },
        { current_semester: 'midyear', current_sy: '2024-2025', sem_start_date: '2025-06-10', uplb_latitude: 14.1651, uplb_longitude: 121.2402 },
        { current_semester: 'first_sem', current_sy: '2025-2026', sem_start_date: '2025-08-19', uplb_latitude: 14.1651, uplb_longitude: 121.2402 },
        { current_semester: 'second_sem', current_sy: '2025-2026', sem_start_date: '2026-01-12', uplb_latitude: 14.1651, uplb_longitude: 121.2402 },
      ])
    }
  }
}
