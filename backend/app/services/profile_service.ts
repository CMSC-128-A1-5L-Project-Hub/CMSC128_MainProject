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
            // Process Form 5
            const form5Name = `${user.userId}_form5_${new Date().getTime()}.${validatedData.form5.extname}`
            await validatedData.form5.moveToDisk(form5Name, 's3')
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

            // Save to the 'students' table
            const student = await Student.create({
                studentNumber: validatedData.studentNumber,
                userId: user.userId,
                enrollmentProofFileId: form5File.fileId,
                college: validatedData.college,
                degreeProgram: validatedData.degreeProgram,
                gender: validatedData.gender,

                emergencyContactName: null,
                emergencyContactNumber: validatedData.emergencyContact,
            })

            return {
                student,
                uploadedFiles: {
                    form5Url,
                    uplbIdUrl,
                },
            }
        }

        // ==========================================
        // SCENARIO B: THE USER IS A LANDLORD
        // ==========================================
        else if (validatedData.role === 'Landlord') {

            // 1. Process Business Permit
            const permitName = `${user.userId}_permit_${new Date().getTime()}.${validatedData.businessPermit.extname}`
            await validatedData.businessPermit.moveToDisk(permitName, 's3')
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
                // businessPermitId: permitFile.fileId,
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
                businessPermitId: permitFile.fileId,
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
                uploadedFiles: {
                    permitUrl,
                },
            }
        }
    }
}

// Notes: -W
// uplbId is uploaded but not connected to Student model