export const ROLES = {
    STUDENT: 'student',
    MANAGER: 'manager',
    LANDLORD: 'landlord'
} as const 

export type Role = (typeof ROLES) [keyof typeof ROLES]