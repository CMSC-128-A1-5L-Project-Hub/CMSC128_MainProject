import type { User } from './user'
import type { Accommodation } from './accommodation'

export interface Landlord {
  userId: number
  tin: string

  user?: User
  accommodations?: Accommodation[]
}