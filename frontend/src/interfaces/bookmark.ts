import type { Student } from './student'
import type { Accommodation } from './accommodation'

export interface Bookmark {
  id: number

  studentNumber: string
  accommodationId: number

  student?: Student
  accommodation?: Accommodation
}