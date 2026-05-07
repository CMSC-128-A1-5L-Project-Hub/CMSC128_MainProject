export type UserRole = "student" | "landlord" | "manager" | "unassigned" | "super_admin"
export type AccountStatus = "pending" | "active" | "suspended"
export type ManagerStatus = "active" | "inactive"
export type YearLevel = "1st Year" | "2nd Year" | "3rd Year" | "4th Year" | "5th Year"

export interface PhoneNumberSeedData {
    contact_number: string
    is_primary: boolean
}

export interface StudentSeedData {
    student_number: string           // max 11 chars, PK
    enrollment_proof_file_id: number // references file_metadata.id
    college: string                  // max 5 chars (e.g. 'CAS', 'CEAT')
    degree_program: string           // max 50 chars
    gender: string                   // max 10 chars
    emergency_contact_name?: string  // max 100 chars
    emergency_contact_number?: string// max 11 chars
    form5_renewal?: boolean
    year_level?: YearLevel
}


export interface LandlordSeedData {
    tin: string   // max 18 chars (TIN format: 000-000-000-000)
}
 
export interface ManagerSeedData {
    manager_status: ManagerStatus
}
 
export interface UserSeedData {
    // users table
    pfp_file_id?: number             // nullable; set after file seeder
    fname: string                    // max 50 chars
    mname?: string                   // max 50 chars
    lname: string                    // max 50 chars
    suffix?: string                  // max 10 chars
    email: string                    // max 75 chars, unique
    facebook_account?: string        // max 100 chars
    role: UserRole
    account_status?: AccountStatus
    // otp_code / otp_expires_at are runtime fields — omitted from seed
    
    // related tables (seeder joins by email → user_id)
    phone_numbers: PhoneNumberSeedData[]
    
    // role-specific profile (only one should be present per user)
    student_profile?: StudentSeedData
    landlord_profile?: LandlordSeedData
    manager_profile?: ManagerSeedData
}
