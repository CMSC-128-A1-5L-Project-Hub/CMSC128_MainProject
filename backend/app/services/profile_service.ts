import User from '#models/user'
import Student from '#models/student'
import Landlord from '#models/landlord'
// import Accommodation from '#models/accommodation'
// import Manager from '#models/manager'
import FileMetadata from '#models/file_metadata'
import Document from '#models/document'
import drive from '@adonisjs/drive/services/main'
import { DateTime } from 'luxon'

export default class ProfileService {
  async setupProfile(user: User, validatedData: any) {
    // ==========================================
    // SCENARIO A: THE USER IS A STUDENT
    // ==========================================
    if (validatedData.role === 'Student') {
      const uploadedForm5Urls: string[] = []
      let enrollmentProofFileId: number | undefined

      // Process MULTIPLE Form 5 files
      for (const file of validatedData.form5) {
        const form5Name = `${user.userId}_form5_${new Date().getTime()}.${file.extname}`
        await file.moveToDisk(form5Name, 's3')
        const form5Url = await drive.use('s3').getUrl(form5Name)

        // Save Form 5 metadata
        const form5File = await FileMetadata.create({
          fileName: form5Name,
          filePath: form5Url,
          fileType: 'document',
        })

        // Save document record
        await Document.create({
          userId: user.userId,
          fileId: form5File.fileId,
          uploadTimestamp: DateTime.now(),
        })

        uploadedForm5Urls.push(form5Url)

        // Save the first file as enrollment proof reference
        if (!enrollmentProofFileId) {
          enrollmentProofFileId = form5File.fileId
        }
      }

      /* Note: UPLB ID not in model or migrations -W
            // Process UPLB ID
            const uplbIdName = `${user.userId}_uplbid_${new Date().getTime()}.${validatedData.uplbId.extname}`
            await validatedData.uplbId.moveToDisk(uplbIdName, 's3')
            const uplbIdUrl = await drive.use('s3').getUrl(uplbIdName)

            // Save UPLB ID metadata
            const uplbIdFile = await FileMetadata.create({
                fileName: uplbIdName,
                filePath: uplbIdUrl,
                fileType: 'image',
            })

            // Save document record
            await Document.create({
                userId: user.userId,
                fileId: uplbIdFile.fileId,
                uploadTimestamp: DateTime.now(),
            })
            */

      // Save to the 'students' table
      const student = await Student.create({
        studentNumber: validatedData.studentNumber,
        userId: user.userId,
        enrollmentProofFileId: enrollmentProofFileId,
        college: validatedData.college,
        degreeProgram: validatedData.degreeProgram,
        gender: validatedData.gender,

        emergencyContactName: validatedData.emergencyContactName,
        emergencyContactNumber: validatedData.emergencyContactNumber,
      })

      return {
        student,
        uploadedFiles: uploadedForm5Urls,
      }
    }

    // ==========================================
    // SCENARIO B: THE USER IS A LANDLORD
    // ==========================================
    else if (validatedData.role === 'Landlord') {
      const uploadedPermitUrls: string[] = []
      let permitFileId: number | undefined

      // Process MULTIPLE Business Permit files
      for (const file of validatedData.businessPermit) {
        const permitName = `${user.userId}_permit_${new Date().getTime()}.${file.extname}`
        await file.moveToDisk(permitName, 's3')
        const permitUrl = await drive.use('s3').getUrl(permitName)

        // Save Business Permit metadata
        const permitFile = await FileMetadata.create({
          fileName: permitName,
          filePath: permitUrl,
          fileType: 'document',
        })

        // Save document record
        await Document.create({
          userId: user.userId,
          fileId: permitFile.fileId,
          uploadTimestamp: DateTime.now(),
        })

        uploadedPermitUrls.push(permitUrl)

        // Save first permit ID if needed later
        if (!permitFileId) {
          permitFileId = permitFile.fileId
        }
      }

      // 2. Save to the 'landlords' table
      const landlord = await Landlord.create({
        userId: user.userId,
        tin: validatedData.tin,
        // contactNumber: validatedData.contactNumber,

        // NOTE: -W
        // These does not exist in the current Landlord model and
        // belong to Accommodation based on the UML.
        // accommodationName: validatedData.accommodationName,
        // businessAddress: validatedData.accommodationLocation,
        // businessPermitId: permitFileId,
      })

      // ==========================================
      // ACCOMMODATION CREATION (TEMPORARILY DISABLED)
      // ==========================================

      // NOTE: -W
      // The accommodation table requires managerId.
      // I'm not sure if a default manager exists,
      // the following logic is prepared but commented out.

      /*
            // Find an active manager to assign to the accommodation
            const manager = await Manager.query()
                .where('managerStatus', 'active')
                .first()

            if (!manager) {
                throw new Error('No active manager found to assign accommodation')
            }

            const accommodation = await Accommodation.create({
                landlordId: landlord.userId,
                managerId: manager.userId,
                businessPermitId: permitFileId,
                accommodationName: validatedData.accommodationName,
                accommodationLocation: validatedData.accommodationLocation,
                accommodationType: validatedData.accommodationType,
                accommodationCapacity: validatedData.accommodationCapacity,
                tenantRestriction: validatedData.tenantRestriction,
                applicationStartDate: DateTime.fromJSDate(validatedData.applicationStartDate),
                applicationEndDate: DateTime.fromJSDate(validatedData.applicationEndDate),
            })
            */

      return {
        landlord,
        uploadedFiles: uploadedPermitUrls,
      }
    }
  }
}

// Notes: -W
// uplbId logic commented out for now in case it is needed later
