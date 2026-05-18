import type { Accommodation } from './accommodation'
import type { Student } from './student'
import type { User } from './user'
import type { Room } from './room'
import type { ApplicationDocument } from './application_document'

export interface Application {
  id: number

  accommodationId: number
  studentNumber: string

  applicationDate: string

  applicationRoomType: 'single' | 'double' | 'shared'
  applicationStayType: 'transient' | 'non_transient'

  rejectionReason: string | null

  applicationStatus:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'waitlisted'
    | 'under_review'
    | 'confirmed'

  durationOfStayDays: number | null

  preferredTags: string[] | null

  reviewedAt: string | null
  reviewedBy: number | null

  approvedAt: string | null
  slotConfirmDeadline: string | null
  slotConfirmedAt: string | null

  roomId: number | null

  moveInDate: string | null
  moveOutDate: string | null

  reservationFee: number | null
  moveInFee: number | null

  accommodation?: Accommodation
  student?: Student
  reviewer?: User
  room?: Room

  documents?: ApplicationDocument[]
}