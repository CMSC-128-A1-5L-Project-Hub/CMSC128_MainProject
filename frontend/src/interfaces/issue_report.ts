import type { User } from './user'

export interface IssueReport {
  id: number

  reporterId: number

  reportableType: 'manager' | 'accommodation'
  reportableId: number

  reason:
    | 'unprofessional_behavior'
    | 'harassment'
    | 'unresponsive'
    | 'fraudulent_activity'
    | 'violation_of_policies'
    | 'inaccurate_listing'
    | 'unsafe'
    | 'fraudulent_listing'
    | 'inappropriate_photos'
    | 'unavailable'
    | 'other'

  additionalDetails: string

  status: 'pending' | 'resolved'

  createdAt: string
  updatedAt: string

  reporter?: User
}