import User from '#models/user'
import Student from '#models/student'
import Landlord from '#models/landlord'
// import Accommodation from '#models/accommodation'
// import Manager from '#models/manager'
import FileMetadata from '#models/file_metadatum'
import Document from '#models/document'
import drive from '@adonisjs/drive/services/main'
import db from '@adonisjs/lucid/services/db'

export default class ProfileService {
  async setupProfile(user: User, validatedData: any) {
    // PhoneNumber is created during OTP verification (/auth/verify-sms), not here.
    
    // ==========================================
    // SCENARIO A: THE USER IS A STUDENT
    // ==========================================
    if (validatedData.role === 'student') {
      // Upload files first (S3 can't be transacted)
      const uploadedForm5Urls: string[] = []
      const uploadedFiles: { fileName: string; filePath: string }[] = []

      for (const file of validatedData.form5 ?? []) {
        const form5Name = `${user.id}_enrollmentproof_${new Date().getTime()}.${file.extname}`
        await file.moveToDisk(form5Name, 's3')
        const form5Url = await drive.use('s3').getUrl(form5Name)
        uploadedForm5Urls.push(form5Url)
        uploadedFiles.push({ fileName: form5Name, filePath: form5Url })
      }

      /* Note: UPLB ID not in model or migrations -W

        Update: Yeah not UPLB ID but a screenshot of their acceptance email instead,
        this is the alternative when they're a freshman and  they don't have a form 5.
        functionally they're the same as the form5 though
        No need to make another for loop for it. should be fine to use the form5 one
        (maybe rename the file name to enrollmentProof instead to be applicable for form 5 or acceptance email)
        - Joshua
            */

      // All DB writes in one transaction — rolls back everything if any step fails
      const student = await db.transaction(async (trx) => {
        user.accountStatus = 'pending'
        user.useTransaction(trx)
        await user.save()

        let enrollmentProofFileId: number | undefined

        for (const { fileName, filePath } of uploadedFiles) {
          const enrollmentProofFile = await FileMetadata.create(
            { fileName, filePath, fileType: 'document' },
            { client: trx }
          )
          await Document.create(
            { userId: user.id, fileId: enrollmentProofFile.id },
            { client: trx }
          )
          if (!enrollmentProofFileId) enrollmentProofFileId = enrollmentProofFile.id
        }

        return Student.create({
          studentNumber: validatedData.student_number,
          userId: user.id,
          enrollmentProofFileId: enrollmentProofFileId,
          college: validatedData.college,
          degreeProgram: validatedData.degree_program,
          gender: validatedData.gender,
          emergencyContactName: validatedData.emergency_contact_name,
          emergencyContactNumber: validatedData.emergency_contact_number,
          yearLevel: validatedData.year_level ?? null,
        }, { client: trx })
      })

      return {
        student: student.serialize(),
        uploadedFiles: uploadedForm5Urls,
      }
    }

    // ==========================================
    // SCENARIO B: THE USER IS A LANDLORD
    // ==========================================
    else if (validatedData.role === 'landlord') {
      // Upload files first (S3 can't be transacted)
      const uploadedPermitUrls: string[] = []
      const uploadedFiles: { fileName: string; filePath: string }[] = []

      for (const file of validatedData.businessPermit ?? []) {
        const permitName = `${user.id}_permit_${new Date().getTime()}.${file.extname}`
        await file.moveToDisk(permitName, 's3')
        const permitUrl = await drive.use('s3').getUrl(permitName)
        uploadedPermitUrls.push(permitUrl)
        uploadedFiles.push({ fileName: permitName, filePath: permitUrl })
      }

      // All DB writes in one transaction — rolls back everything if any step fails
      const landlord = await db.transaction(async (trx) => {
        user.accountStatus = 'pending'
        user.useTransaction(trx)
        await user.save()

        let permitFileId: number | undefined

        for (const { fileName, filePath } of uploadedFiles) {
          const permitFile = await FileMetadata.create(
            { fileName, filePath, fileType: 'document' },
            { client: trx }
          )
          await Document.create(
            { userId: user.id, fileId: permitFile.id },
            { client: trx }
          )
          if (!permitFileId) permitFileId = permitFile.id
        }

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

        return Landlord.create({
          userId: user.id,
          tin: validatedData.tin,
          // contactNumber: validatedData.contactNumber,

          // NOTE: -W
          // These does not exist in the current Landlord model and
          // belong to Accommodation based on the UML.
          // accommodationName: validatedData.accommodationName,
          // businessAddress: validatedData.accommodationLocation,
          // businessPermitId: permitFileId,
        }, { client: trx })
      })

      return {
        landlord: landlord.serialize(),
        uploadedFiles: uploadedPermitUrls,
      }
    }
  }
}

// Notes: -W
// uplbId logic commented out for now in case it is needed later
