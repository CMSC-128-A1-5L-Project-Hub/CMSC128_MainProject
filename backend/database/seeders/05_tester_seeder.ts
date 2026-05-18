import User from "#models/user";
import Student from "#models/student";
import FileMetadata from "#models/file_metadatum";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { makeEnrollmentProof, Users, Students } from "#database/seed_data/users";

/*
    Seeder for A1-5L accounts [FOR TESTING]

    See #database/seed_data/users.ts for seed data
    Do not modify without permission

    Intentionally separate from 00_user_seeder.ts to avoid seeding assignments, fees, and payments
*/

export default class UserSeeder extends BaseSeeder {
    async run() {
        for (const user of Users) {
            await User.firstOrCreate({ email: user.email }, { ...user })
        }

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