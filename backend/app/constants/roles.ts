export const ROLES = {
  STUDENT: 'student',
  MANAGER: 'manager',
  LANDLORD: 'landlord',
  SUPER_ADMIN: 'super_admin'
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
