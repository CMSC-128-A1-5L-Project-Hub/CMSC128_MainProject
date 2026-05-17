import type { User } from './user'

export interface PhoneNumber {
  id: number

  userId: number

  contactNumber: string
  isPrimary: boolean

  user?: User
}