import type { User } from './user'
import type { FileMetadata } from './file_metadatum'

export interface Document {
  id: number

  userId: number
  fileId: number

  uploadTimestamp: string

  user?: User
  file?: FileMetadata
}