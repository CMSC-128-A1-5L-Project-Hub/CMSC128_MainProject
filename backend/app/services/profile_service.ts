import User from '#models/user'
import Student from '#models/student' //## NOTE: Waiting for the models from the DB team
import Landlord from '#models/landlord'
import drive from '@adonisjs/drive/services/main'

export default class ProfileService {
    async setupProfile(user: User, validatedData: any) {
        
        // ==========================================
        // SCENARIO A: THE USER IS A STUDENT
        // ==========================================
        if (validatedData.role === 'Student') {
            // Process Form 5
            const form5Name = `${user.id}_form5_${new Date().getTime()}.${validatedData.form5.extname}`
            await validatedData.form5.moveToDisk(form5Name, 'backblaze')
            const form5Url = await drive.use('backblaze').getUrl(form5Name)

            // Process UPLB ID
            const uplbIdName = `${user.id}_uplbid_${new Date().getTime()}.${validatedData.uplbId.extname}`
            await validatedData.uplbId.moveToDisk(uplbIdName, 'backblaze')
            const uplbIdUrl = await drive.use('backblaze').getUrl(uplbIdName)

            // Save to the 'students' table
            // const student = 

            // return student
        }

        // ==========================================
        // SCENARIO B: THE USER IS A LANDLORD
        // ==========================================
        else if (validatedData.role === 'Landlord') {
            
            // 1. Process Business Permit
            const permitName = `${user.id}_permit_${new Date().getTime()}.${validatedData.businessPermit.extname}`
            await validatedData.businessPermit.moveToDisk(permitName, 'backblaze')
            const permitUrl = await drive.use('backblaze').getUrl(permitName)

            // 2. Save to the 'landlords' table
            // const landlord = 

            // return landlord
        }
    }
}
