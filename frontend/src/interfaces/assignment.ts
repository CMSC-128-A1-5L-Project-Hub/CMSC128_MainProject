import type { Student } from './student'
import type { Room } from './room'

export interface Assignment {
  id: number

  studentNumber: string
  roomId: number

  confirmedDate: string

  confirmationStatus: 'pending_confirmation' | 'active' | 'rejected' | 'cancelled'

  moveIn: string
  expectedMoveOut: string
  actualMoveOut: string | null

  gracePeriodDays: number

  student?: Student
  room?: Room
}