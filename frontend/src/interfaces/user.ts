import type { FileMetadata } from './file_metadatum'
import type { Landlord } from './landlord'
import type { Manager } from './manager'
import type { Student } from './student'
import type { PhoneNumber } from './phone_number'

export interface User {
  id: number

  pfpFileId: number | null

  fname: string
  mname: string | null
  lname: string
  suffix: string | null

  email: string
  facebookAccount: string | null

  role: 'student' | 'landlord' | 'manager' | 'unassigned' | 'super_admin'

  accountStatus: 'pending' | 'active' | 'suspended' | 'rejected' | null

  otpCode: string | null
  otpExpiresAt: string | null

  submittedAt: string | null

  profilePicture?: FileMetadata

  landlord?: Landlord
  manager?: Manager
  student?: Student

  phoneNumbers?: PhoneNumber[]
}