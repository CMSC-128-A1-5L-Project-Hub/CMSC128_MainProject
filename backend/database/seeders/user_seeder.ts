import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import FileMetadata from '#models/file_metadata'
import promptSync from 'prompt-sync'

export default class extends BaseSeeder {
  async run() {
    const prompt = promptSync()

    const fname = prompt('Enter first name: ')
    const lname = prompt('Enter last name: ')
    const email = prompt('Enter UP mail: ')
    const role = prompt('Enter role (student/landlord/manager/super_admin): ')

    if (!['student', 'landlord', 'manager', 'super_admin', 'unassigned'].includes(role)) {
      console.log('Invalid role! Must be student, landlord, manager, or super_admin.')
      return
    }

    const defaultPfp = await FileMetadata.findByOrFail('file_path', 'defaults/default_pfp.png')

    await User.create({
      fname,
      lname,
      email,
      role,
      pfpFileId: defaultPfp.fileId,
    })

    console.log(`User ${fname} ${lname} created successfully with role: ${role}`)
  }
}