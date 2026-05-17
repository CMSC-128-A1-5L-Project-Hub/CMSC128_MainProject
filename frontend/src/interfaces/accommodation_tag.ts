import type { Accommodation } from './accommodation'

export interface AccommodationTag {
  id: number
  accommodationId: number
  tagDetail: string

  accommodation?: Accommodation
}