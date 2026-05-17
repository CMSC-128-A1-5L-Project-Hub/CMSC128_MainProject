import type { Accommodation } from './accommodation'
import type { Assignment } from './assignment'
import type { RoomTag } from './room_tag'

export interface Room {
  id: number

  accommodationId: number
  roomNumber: string

  roomType: 'single' | 'double' | 'shared'
  roomStayType: 'transient' | 'non_transient'

  roomCapacity: number
  roomCurrentOccupancy: number

  roomBuilding: string

  roomRent: number

  tenantRestriction: 'coed' | 'non-coed'

  roomAvailability: 'available' | 'occupied' | 'maintenance'

  advanceMonths: number
  depositMonths: number

  roomSize: number | null

  reservationFeeType: 'fixed' | 'percentage' | null
  reservationFeeValue: number | null

  accommodation?: Accommodation
  assignments?: Assignment[]
  tags?: RoomTag[]
}