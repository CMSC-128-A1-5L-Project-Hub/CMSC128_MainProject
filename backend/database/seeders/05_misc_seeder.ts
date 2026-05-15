import db from '@adonisjs/lucid/services/db'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

async function isTableEmpty(table: string): Promise<boolean> {
  const result = await db.from(table).count('* as c')
  return Number(result[0].c) === 0
}

export default class MiscSeeder extends BaseSeeder {
  async run() {
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
