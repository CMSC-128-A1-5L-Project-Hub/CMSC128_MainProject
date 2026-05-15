import type { Room } from './room'
import type { User } from './user'

export interface RoomIssue {
  id: number

  roomId: number
  reporterId: number

  reporterRole: 'student' | 'manager'

  issueDetails: string

  status: 'open' | 'resolved'

  resolvedBy: number | null
  resolvedAt: string | null

  createdAt: string
  updatedAt: string

  room?: Room
  reporter?: User
  resolver?: User
}