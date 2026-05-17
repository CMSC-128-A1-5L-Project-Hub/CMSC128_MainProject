import type { Fee } from './fee'
import type { FileMetadata } from './file_metadatum'

export interface Payment {
  id: number

  feeId: number
  proofFileId: number | null

  paymentTimestamp: string

  paymentAmount: number
  modeOfPayment: string

  paymentStatus: 'pending' | 'verified' | 'rejected'

  fee?: Fee
  proofFile?: FileMetadata
}