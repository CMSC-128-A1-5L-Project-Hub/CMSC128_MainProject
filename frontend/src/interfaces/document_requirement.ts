import type { Accommodation } from './accommodation'

export interface DocumentRequirement {
  id: number

  accommodationId: number
  requirementName: string
  acceptedFormat: 'pdf' | 'image' | 'any'

  createdAt: string
  updatedAt: string

  accommodation?: Accommodation
}