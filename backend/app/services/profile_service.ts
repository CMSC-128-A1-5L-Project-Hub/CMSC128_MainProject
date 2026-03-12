import User from '#models/user'
import Student from '#models/student' 
import Landlord from '#models/landlord'
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
                degreeProgram: validatedData.course, // validator uses 'course'
                gender: validatedData.gender,

                // NOTE: Current validator only has one emergencyContact field
                // Adjust this once the setup form separates name and number
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
                accommodationName: validatedData.accommodationName,
                businessAddress: validatedData.businessAddress,
                contactNumber: validatedData.contactNumber,
                businessPermitId: permitFile.fileId,
            })

            return {
                landlord,
                uploadedFiles: {
                    permitUrl,
                },
            }
        }
    }
}

// Notes:
// uplbId is uploaded but not connected to Student model
// 