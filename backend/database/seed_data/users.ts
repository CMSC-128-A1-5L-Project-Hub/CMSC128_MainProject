export interface UserSeedData {
    email: string
    fname: string
    lname: string
    role: 'student' | 'landlord' | 'manager' | 'super_admin' | 'unassigned'
    account_status?: 'pending' | 'active' | 'suspended'
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

export interface FileMetadataSeedData {
    fileName: string
    filePath: string
    fileType: 'document' | 'image' | undefined
}

/*
    HELPERS
*/

//for fake enrollment proofs
export const makeEnrollmentProof = (user: UserSeedData): FileMetadataSeedData => {
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
    },
    {
        email: 'ddcadsawan@up.edu.ph',
        fname: 'System',
        lname: 'Administrator',
        role: 'super_admin'
    },
    {
        email: 'windee0109@gmail.com',
        fname: 'System',
        lname: 'Administrator',
        role: 'super_admin'
    },
]

export const Users: UserSeedData[] = [
    {
        email: 'kabahay@up.edu.ph',
        fname: 'Kent Benedick',
        lname: 'Bahay',
        role: 'manager',
        account_status: 'active'
    },
    {
        email: 'ctbernardino@up.edu.ph',
        fname: 'Clarence Joshua',
        lname: 'Tan',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'pvcacot@up.edu.ph',
        fname: 'Princess Ann',
        lname: 'Cacot',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'jecamba@up.edu.ph',
        fname: 'Jan Zuriel',
        lname: 'Emperador',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'jacarlos2@up.edu.ph',
        fname: 'Joshua',
        lname: 'Carlos',
        role: 'landlord',
        account_status: 'active'
    },
    {
        email: 'lschan1@up.edu.ph',
        fname: 'Liesl Erica',
        lname: 'Chan',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'gmcustodio1@up.edu.ph',
        fname: 'Grandwin Gabriel',
        lname: 'Custodio',
        role: 'manager',
        account_status: 'active'
    },
    {
        email: 'wederamos@up.edu.ph',
        fname: 'Windee Rose',
        lname: 'De Ramos',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'jdestadilla@up.edu.ph',
        fname: 'John David',
        lname: 'Estadilla',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'vcgonzales@up.edu.ph',
        fname: 'Vinz Uriel',
        lname: 'Gonzales',
        role: 'manager',
        account_status: 'active'
    },
    {
        email: 'joguevarra5@up.edu.ph',
        fname: 'Joy Christine Laura',
        lname: 'Guevarra',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'lojamison@up.edu.ph',
        fname: 'Leon Emmanuel',
        lname: 'Jamison',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'jpomamos1@up.edu.ph',
        fname: 'Jun Paul Allan',
        lname: 'Omamos',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'mvreyes8@up.edu.ph',
        fname: 'Marcus Naethan',
        lname: 'Reyes',
        role: 'landlord',
        account_status: 'active'
    },
    {
        email: 'msrilloraza@up.edu.ph',
        fname: 'Misha Sophia',
        lname: 'Rilloraza',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'jssison5@up.edu.ph',
        fname: 'Janelle Cassandra',
        lname: 'Sison',
        role: 'landlord',
        account_status: 'active'
    },
    {
        email: 'svuntalan1@up.edu.ph',
        fname: 'Sophia Jeanine',
        lname: 'Untalan',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'eavillamor@up.edu.ph',
        fname: 'Enzo Paolo Joaquin',
        lname: 'Villamor',
        role: 'student',
        account_status: 'active'
    },

    /*
        Special accounts
    */
    {
        email: 'kndxyl@gmail.com',
        fname: 'Kendal',
        lname: 'Diaz',
        role: 'student',
        account_status: 'active'
    },
    {
        email: 'daltoncadsawan4@gmail.com',
        fname: 'Dalton Ken',
        lname: 'Cadsawan',
        role: 'landlord',
        account_status: 'active'
    },
    {
        email: 'cadsawan.daltonken.0116@gmail.com',
        fname: 'Dalton Ken',
        lname: 'Cadsawan',
        role: 'manager',
        account_status: 'active'
    },
    {
        email: 'yuuhhhmimi@gmail.com',
        fname: 'Marcus Naethan',
        lname: 'Reyes',
        role: 'manager',
        account_status: 'active'
    },
    {
        email: 'marcusnaethan@gmail.com',
        fname: 'Marcus Naethan',
        lname: 'Reyes',
        role: 'student',
        account_status: 'active'
    },
]

export const Landlords: LandlordSeedData[] = [
    {
        email: 'jacarlos2@up.edu.ph',
        tin: '123-456-789-012'
    },
    {
        email: 'daltoncadsawan4@gmail.com',
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
        managerStatus: 'inactive'
    },
    {
        email: 'gmcustodio1@up.edu.ph',
        managerStatus: 'inactive'
    },
    {
        email: 'vcgonzales@up.edu.ph',
        managerStatus: 'inactive'
    },
    {
        email: 'eavillamor@up.edu.ph',
        managerStatus: 'inactive'
    },
    {
        email: 'cadsawan.daltonken.0116@gmail.com',
        managerStatus: 'inactive'
    },
    {
        email: 'yuuhhhmimi@gmail.com',
        managerStatus: 'inactive'
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
    {
        email: 'kndxyl@gmail.com',
        studentNumber: '2023-05432',
        college: 'cas',
        degreeProgram: 'BS Computer Science',
        gender: 'female'
    },
]