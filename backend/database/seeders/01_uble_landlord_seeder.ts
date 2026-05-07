import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Landlord from '#models/landlord'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class UbleLandlordSeeder extends BaseSeeder {
  async run() {
    const landlordUser = await User.firstOrCreate(
      { email: 'uble.ics.uplb@gmail.com' },
      {
        fname: 'UBLE',
        lname: 'ICS UPLB',
        email: 'uble.ics.uplb@gmail.com',
        role: 'landlord',
      }
    )

    await Landlord.firstOrCreate(
      { userId: landlordUser.id },
      {
        userId: landlordUser.id,
        tin: '000-000-000-000',
      }
    )

    const managerUser = await User.firstOrCreate(
      { email: 'manager.uble.test@gmail.com' },
      {
        fname: 'Rosa',
        lname: 'Dela Cruz',
        email: 'manager.uble.test@gmail.com',
        role: 'manager',
      }
    )

    const existingPhone = await db
      .from('phone_numbers')
      .where('user_id', managerUser.id)
      .where('is_primary', true)
      .first()
    if (!existingPhone) {
      await db
        .table('phone_numbers')
        .insert({ user_id: managerUser.id, contact_number: '09191234567', is_primary: true })
    }

    const existingManager = await db.from('managers').where('user_id', managerUser.id).first()
    if (!existingManager) {
      await db.table('managers').insert({ user_id: managerUser.id, manager_status: 'active' })
    }
  }
}
