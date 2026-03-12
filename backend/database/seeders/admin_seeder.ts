import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import FileMetadata from '#models/file_metadata'

export default class AdminSeeder extends BaseSeeder {
  async run() {
    const defaultPfp = await FileMetadata.findByOrFail('file_path', 'defaults/default_pfp.png')

    await User.updateOrCreate(
      { email: 'usat.superadmin@up.edu.ph' },
      {
        pfpFileId: defaultPfp.fileId,
        fname: 'USAT',
        lname: 'Admin',
        email: 'usat.superadmin@up.edu.ph',
        role: 'super_admin',
      }
    )

    console.log('Super Admin seeded successfully.')
  }
}

