import type { Landlord } from './landlord'
import type { Student } from './student'
import type { FileMetadata } from './file_metadatum'

export interface Report {
  id: number

  landlordId: number
  studentNumber: string
  reportFileId: number

  reportType: 'billing' | 'assignment'

  reportTimestamp: string

  landlord?: Landlord
  student?: Student
  reportFile?: FileMetadata
}