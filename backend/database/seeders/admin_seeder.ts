import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class AdminSeeder extends BaseSeeder {
  async run() {
    await User.firstOrCreate(
      { email: 'jacarlos2@up.edu.ph' },
      {
        fname: 'System',
        lname: 'Administrator',
        email: 'jacarlos2@up.edu.ph',
        role: 'super_admin',
        // pfpFileId is nullable, so we can leave it out
      }
    )

    await User.firstOrCreate(
      { email: 'wederamos@up.edu.ph' },
      {
        fname: 'System',
        lname: 'Administrator',
        email: 'wederamos@up.edu.ph',
        role: 'super_admin',
        // pfpFileId is nullable, so we can leave it out
      }
    )
  }
}