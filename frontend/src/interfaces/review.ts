import type { Accommodation } from './accommodation'
import type { Student } from './student'

export interface Review {
  id: number

  accommodationId: number
  studentNumber: string

  rating: number
  content: string | null

  createdAt: string

  accommodation?: Accommodation
  student?: Student
}