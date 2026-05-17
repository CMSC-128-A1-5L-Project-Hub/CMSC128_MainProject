import type { User } from './user'
import type { Accommodation } from './accommodation'

export interface Manager {
  userId: number

  managerStatus: 'active' | 'inactive'

  verifiedAt: string | null

  user?: User
  accommodations?: Accommodation[]
}