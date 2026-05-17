import type { User } from './user'

export interface Notification {
  id: number

  userId: number

  notificationContent: string

  readStatus: 'read' | 'unread'

  notificationType: 'fee_due' | 'application_status' | 'system' | 'other'

  notificationTimestamp: string

  user?: User
}