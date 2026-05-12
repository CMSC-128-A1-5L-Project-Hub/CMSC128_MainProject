export interface UserSeedData {
    email: string
    fname: string
    lname: string
    role: 'student' | 'landlord' | 'manager' | 'super_admin' | 'unassigned'
}

export interface LandlordSeedData {
    email: string
    tin: string
}

export interface ManagerSeedData {
    email: string
    managerStatus: 'active' | 'inactive'
}

export interface StudentSeedData {
    email: string
    studentNumber: string
    college: string
    degreeProgram: string
    gender: string
}

/*
    HELPERS
*/

//for fake enrollment proofs
const makeEnrollmentProof = (user: UserSeedData) => {
    const slug = user.email.split('@')[0]

    return {
        fileName: `enrollment_proof_${slug}.pdf`,
        filePath: `/uploads/documents/enrollment_proof_${slug}.pdf`,
        fileType: 'document'
    }
}

export const SuperAdmins: UserSeedData[] = [
    {
        email: 'uble.ics.uplb@gmail.com',
        fname: 'System',
        lname: 'Administrator',
        role: 'super_admin'
    }
]

export const Users: UserSeedData[] = [
    {
        email: 'kabahay@up.edu.ph',
        fname: 'Kent Benedick',
        lname: 'Bahay',
        role: 'manager'
    },
    {
        email: 'ctbernardino@up.edu.ph',
        fname: 'Clarence Joshua',
        lname: 'Tan',
        role: 'student'
    },
    {
        email: 'pvcacot@up.edu.ph',
        fname: 'Princess Ann',
        lname: 'Cacot',
        role: 'student'
    },
    {
        email: 'ddcadsawan@up.edu.ph',
        fname: 'Dalton Ken',
        lname: 'Cadsawan',
        role: 'landlord'
    },
    {
        email: 'jecamba@up.edu.ph',
        fname: 'Jan Zuriel',
        lname: 'Emperador',
        role: 'student'
    },
    {
        email: 'jacarlos2@up.edu.ph',
        fname: 'Joshua',
        lname: 'Carlos',
        role: 'landlord'
    },
    {
        email: 'lschan1@up.edu.ph',
        fname: 'Liesl Erica',
        lname: 'Chan',
        role: 'student'
    },
    {
        email: 'gmcustodio1@up.edu.ph',
        fname: 'Grandwin Gabriel',
        lname: 'Custodio',
        role: 'manager'
    },
    {
        email: 'wederamos@up.edu.ph',
        fname: 'Windee Rose',
        lname: 'De Ramos',
        role: 'student'
    },
    {
        email: 'jdestadilla@up.edu.ph',
        fname: 'John David',
        lname: 'Estadilla',
        role: 'student'
    },
    {
        email: 'vcgonzales@up.edu.ph',
        fname: 'Vinz Uriel',
        lname: 'Gonzales',
        role: 'manager'
    },
    {
        email: 'joguevarra5@up.edu.ph',
        fname: 'Joy Christine Laura',
        lname: 'Guevarra',
        role: 'student'
    },
    {
        email: 'lojamison@up.edu.ph',
        fname: 'Leon Emmanuel',
        lname: 'Jamison',
        role: 'student'
    },
    {
        email: 'jpomamos1@up.edu.ph',
        fname: 'Jun Paul Allan',
        lname: 'Omamos',
        role: 'student'
    },
    {
        email: 'mvreyes8@up.edu.ph',
        fname: 'Marcus Naethan',
        lname: 'Reyes',
        role: 'landlord'
    },
    {
        email: 'msrilloraza@up.edu.ph',
        fname: 'Misha Sophia',
        lname: 'Rilloraza',
        role: 'student'
    },
    {
        email: 'jssison5@up.edu.ph',
        fname: 'Janelle Cassandra',
        lname: 'Sison',
        role: 'landlord'
    },
    {
        email: 'svuntalan1@up.edu.ph',
        fname: 'Sophia Jeanine',
        lname: 'Untalan',
        role: 'student'
    },
    {
        email: 'eavillamor@up.edu.ph',
        fname: 'Enzo Paolo Joaquin',
        lname: 'Villamor',
        role: 'manager'
    }
]

export const Landlords: LandlordSeedData[] = [
    {
        email: 'jacarlos2@up.edu.ph',
        tin: '123-456-789-012'
    },
    {
        email: 'ddcadsawan@up.edu.ph',
        tin: '234-567-890-123'
    },
    {
        email: 'mvreyes8@up.edu.ph',
        tin: '345-678-901-234'
    },
    {
        email: 'jssison5@up.edu.ph',
        tin: '456-789-012-345'
    },
    
]

export const Managers: ManagerSeedData[] = [
    {
        email: 'kabahay@up.edu.ph',
        managerStatus: 'active'
    },
    {
        email: 'gmcustodio1@up.edu.ph',
        managerStatus: 'active'
    },
    {
        email: 'vcgonzales@up.edu.ph',
        managerStatus: 'active'
    },
    {
        email: 'eavillamor@up.edu.ph',
        managerStatus: 'active'
    },
]

export const Students: StudentSeedData[] = [
    {
        email: 'pvcacot@up.edu.ph',
        studentNumber: '2023-12345',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'female'
    },
    {
        email: 'jecamba@up.edu.ph',
        studentNumber: '2023-23451',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'male'
    },
    {
        email: 'lschan1@up.edu.ph',
        studentNumber: '2023-34512',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'female'
    },
    {
        email: 'wederamos@up.edu.ph',
        studentNumber: '2023-45123',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'female'
    },
    {
        email: 'jdestadilla@up.edu.ph',
        studentNumber: '2023-51234',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'male'
    },
    {
        email: 'joguevarra5@up.edu.ph',
        studentNumber: '2023-54321',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'female'
    },
    {
        email: 'lojamison@up.edu.ph',
        studentNumber: '2023-43215',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'male'
    },
    {
        email: 'jpomamos1@up.edu.ph',
        studentNumber: '2023-32154',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'male'
    },
    {
        email: 'msrilloraza@up.edu.ph',
        studentNumber: '2023-21543',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'female'
    },
    {
        email: 'svuntalan1@up.edu.ph',
        studentNumber: '2023-15432',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'female'
    },
]