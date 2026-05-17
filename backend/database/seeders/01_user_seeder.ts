import db from "@adonisjs/lucid/services/db";
import User from "#models/user";
import Student from "#models/student";
import Landlord from "#models/landlord";
import Manager from "#models/manager";
import FileMetadata from "#models/file_metadatum";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { makeEnrollmentProof, SuperAdmins, Users, Landlords, Managers } from "#database/seed_data/users";
import { FakeUsers, FakeStudents } from "#database/seed_data/fake_students";

/*
    See #database/seed_data/users.ts for seed data
    Do not modify without permission
*/

// includes both A1-5L profiles and fake students
const ALL_USERS = [...Users, ...FakeUsers]

export default class UserSeeder extends BaseSeeder {
    async run() {
        // Uncomment to wipe only fake students
        // const fakeEmails = FakeUsers.map((u) => u.email)
        // const fakeUsers = await User.query().whereIn('email', fakeEmails)
        // const fakeUserIds = fakeUsers.map((u) => u.id)

        // if (fakeUserIds.length > 0) {
        //     await Student.query().whereIn('userId', fakeUserIds).delete()
        //     await User.query().whereIn('id', fakeUserIds).delete()
        // }

        // 1. Super admin/s
        for (const admin of SuperAdmins) {
            await User.firstOrCreate({email: admin.email}, { ...admin })
        }

        // 2. Users that are not super admin/s
        // Use Users instead of ALL_USERS if fake users won't be included
        for (const user of ALL_USERS) {
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
        // Use Students instead of ALL_STUDENTS if fake students won't be included
        for (const student of FakeStudents) {
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