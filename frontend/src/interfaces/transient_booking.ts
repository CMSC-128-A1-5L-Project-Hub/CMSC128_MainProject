import type { Room } from './room'
import type { Student } from './student'
import type { FileMetadata } from './file_metadatum'

export interface TransientBooking {
  id: number

  roomId: number
  studentNumber: string

  checkInDate: string
  checkOutDate: string

  createdAt: string
  paymentDeadline: string

  proofFileId: number | null

  status:
    | 'pending_payment'
    | 'pending_verification'
    | 'confirmed'
    | 'rejected'
    | 'expired'

  room?: Room
  student?: Student
  proofFile?: FileMetadata
}