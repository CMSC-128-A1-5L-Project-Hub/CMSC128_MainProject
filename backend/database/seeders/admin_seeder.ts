import User from '#models/user'
import Student from '#models/student'
import Landlord from '#models/landlord'
import FileMetadata from '#models/file_metadatum'
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
      { email: 'windee0109@gmail.com' },
      {
        fname: 'System',
        lname: 'Administrator',
        email: 'windee0109@gmail.com',
        role: 'super_admin',
        // pfpFileId is nullable, so we can leave it out
      }
    )

    await User.firstOrCreate(
      { email: 'ctbernardino@up.edu.ph' },
      {
        fname: 'System',
        lname: 'Administrator',
        email: 'ctbernardino@up.edu.ph',
        role: 'super_admin',
        // pfpFileId is nullable, so we can leave it out
      }
    )

    await User.firstOrCreate(
      { email: 'jpomamos1@up.edu.ph' },
      {
        fname: 'System',
        lname: 'Administrator',
        email: 'jpomamos1@up.edu.ph',
        role: 'super_admin',
        // pfpFileId is nullable, so we can leave it out
      }
    )

    const ubleLandlordUser = await User.firstOrCreate(
      { email: 'uble.ics.uplb@gmail.com' },
      {
        fname: 'UBLE',
        lname: 'ICS UPLB',
        email: 'uble.ics.uplb@gmail.com',
        role: 'landlord',
      }
    )

    await Landlord.firstOrCreate(
      { userId: ubleLandlordUser.id },
      {
        userId: ubleLandlordUser.id,
        tin: '000-000-000-000',
      }
    )

    const placeholderFile = await FileMetadata.firstOrCreate(
      { fileName: 'enroll_placeholder_carlsjohsua.pdf' },
      {
        fileName: 'enroll_placeholder_carlsjohsua.pdf',
        filePath: '/uploads/documents/enroll_placeholder_carlsjohsua.pdf',
        fileType: 'document',
      }
    )

    const placeholderFile2 = await FileMetadata.firstOrCreate(
      { fileName: 'enroll_placeholder_clarencebernardino645.pdf' },
      {
        fileName: 'enroll_placeholder_clarencebernardino645.pdf',
        filePath: '/uploads/documents/enroll_placeholder_cclarencebernardino645.pdf',
        fileType: 'document',
      }
    )

    const joshuaUser = await User.firstOrCreate(
      { email: 'carlsjohsua@gmail.com' },
      {
        fname: 'Joshua',
        lname: 'Carlos',
        email: 'carlsjohsua@gmail.com',
        role: 'student',
      }
    )

    const clarenceUser = await User.firstOrCreate(
      { email: 'clarencebernardino645@gmail.com' },
      {
        fname: 'Clarence',
        lname: 'Bernardino',
        email: 'clarencebernardino645@gmail.com',
        role: 'student',
      }
    )

    await Student.firstOrCreate(
      { userId: joshuaUser.id },
      {
        studentNumber: '2024-000001',
        userId: joshuaUser.id,
        enrollmentProofFileId: placeholderFile.id,
        college: 'CAS',
        degreeProgram: 'BS Computer Science',
        gender: 'Male',
      }
    )

    await Student.firstOrCreate(
      { userId: clarenceUser.id },
      {
        studentNumber: '2024-000002',
        userId: clarenceUser.id,
        enrollmentProofFileId: placeholderFile2.id,
        college: 'CAS',
        degreeProgram: 'BS Computer Science',
        gender: 'Male',
      }
    )
  }
}