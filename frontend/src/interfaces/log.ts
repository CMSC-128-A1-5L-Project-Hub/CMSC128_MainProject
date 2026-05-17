import type { User } from './user'

export interface Log {
  id: number

  actorId: number | null

  entityType:
    | 'application'
    | 'assignment'
    | 'payment'
    | 'room'
    | 'accommodation'
    | 'document'
    | 'report'
    | 'fee'
    | 'account'

  entityId: number

  logTimestamp: string

  activityType: string
  activityDetails: string | null

  actor?: User
}