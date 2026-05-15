import type { User } from './user'
import type { FileMetadata } from './file_metadatum'
import type { Application } from './application'
import type { Assignment } from './assignment'
import type { Bookmark } from './bookmark'
import type { Review } from './review'

export interface Student {
  studentNumber: string

  userId: number
  enrollmentProofFileId: number

  college: string
  degreeProgram: string
  gender: string

  emergencyContactName: string | null
  emergencyContactNumber: string | null

  yearLevel: string | null

  form5Renewal: boolean

  user?: User
  enrollmentProof?: FileMetadata

  applications?: Application[]
  assignments?: Assignment[]
  bookmarks?: Bookmark[]
  reviews?: Review[]
}