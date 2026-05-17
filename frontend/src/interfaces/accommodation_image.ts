import type { Accommodation } from './accommodation'
import type { FileMetadata } from './file_metadatum'

export interface AccommodationImage {
  id: number
  accommodationId: number
  imageFileId: number

  accommodation?: Accommodation
  file?: FileMetadata
}