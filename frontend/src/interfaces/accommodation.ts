import type { Landlord } from './landlord'
import type { Manager } from './manager'
import type { FileMetadata } from './file_metadatum'
import type { AccommodationImage } from './accommodation_image'
import type { AccommodationTag } from './accommodation_tag'
import type { Room } from './room'
import type { Review } from './review'
import type { Bookmark } from './bookmark'
import type { Application } from './application'
import type { DocumentRequirement } from './document_requirement'

export interface Accommodation {
  id: number

  landlordId: number
  managerId: number | null
  businessPermitId: number

  accommodationName: string
  accommodationLocation: string

  status: 'pending' | 'verified' | 'rejected'

  longitude: number | null
  latitude: number | null

  walkingDistance: number | null
  bikingDistance: number | null
  drivingDistance: number | null

  accommodationType: 'on-campus' | 'off-campus' | 'partner_housing'

  accommodationCapacity: number
  accommodationSize: number

  tenantRestriction: 'male-only' | 'female-only' | 'coed'

  invitedManagerEmail: string | null

  applicationStartDate: string | null
  applicationEndDate: string | null

  primaryImageIndex: number

  isFrozen: boolean
  contractMonths: number
  primaryImageUrl?: string
  freezeReason: string | null
  freezeStartedAt: string | null

  landlord?: Landlord
  manager?: Manager
  businessPermit?: FileMetadata

  images?: AccommodationImage[]
  tags?: AccommodationTag[]
  rooms?: Room[]
  reviews?: Review[]
  bookmarks?: Bookmark[]
  applications?: Application[]
  documentRequirements?: DocumentRequirement[]
}