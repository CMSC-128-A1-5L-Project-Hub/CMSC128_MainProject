import User from "#models/user";
import Student from "#models/student";
import Landlord from "#models/landlord";
import Manager from "#models/manager";
import FileMetadata from "#models/file_metadatum";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { makeEnrollmentProof, SuperAdmins, Users, Landlords, Managers, Students } from "#database/seed_data/users";

/*
    See #database/seed_data/users.ts for seed data
    Do not modify without permission
*/

export default class UserSeeder extends BaseSeeder {
    async run() {
        // 1. Super admin/s
        for (const admin of SuperAdmins) {
            await User.firstOrCreate({email: admin.email}, { ...admin })
        }

        // 2. Users that are not super admin/s
        for (const user of Users) {
            await User.firstOrCreate({ email: user.email }, { ...user })
        }

        // 3. Landlords
        for (const landlord of Landlords) {
            const user = await User.findByOrFail('email', landlord.email)
            await Landlord.firstOrCreate(
                { userId: user.id },
                { userId: user.id, tin: landlord.tin }
            )
        }

        // 4. Managers
        for (const manager of Managers) {
            const user = await User.findByOrFail('email', manager.email)
            await Manager.firstOrCreate(
                { userId: user.id },
                { userId: user.id, managerStatus: manager.managerStatus}
            )
        }

        // 5. Students
        for (const student of Students) {
            const user = await User.findByOrFail('email', student.email)

            // create fake enrollment proof
            const enrollmentProofData = makeEnrollmentProof(user)
            const enrollmentProof = await FileMetadata.firstOrCreate(
                { fileName: enrollmentProofData.fileName },
                { ...enrollmentProofData }
            )

            await Student.firstOrCreate(
                { userId: user.id },
                {
                    userId: user.id,
                    studentNumber: student.studentNumber,
                    enrollmentProofFileId: enrollmentProof.id,
                    college: student.college,
                    degreeProgram: student.degreeProgram,
                    gender: student.gender
                }
            )
        }
    }
}