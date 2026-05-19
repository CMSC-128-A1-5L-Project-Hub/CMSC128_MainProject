import { create } from 'zustand'

// ─── Raw API types ──────────────────────────────────────────────────
export type RawProfile = {
  fname: string
  lname: string
  email: string
  role: string
  accountStatus: string
  dormitory?: string | null
  phoneNumbers?: { contactNumber: string; isPrimary: boolean }[]
  profilePictureUrl?: string | null
}

// In your useDashboardStore.ts, update RawApplication interface:
export interface RawApplication {
  id: number
  accommodationId: number
  studentNumber: string
  applicationDate: string
  applicationRoomType: string
  applicationStayType: string
  rejectionReason: string | null
  applicationStatus: string
  durationOfStayDays: number | null
  preferredTags: string[] | string | null
  reviewedAt: string | null
  reviewedBy: number | null
  approvedAt: string | null
  slotConfirmDeadline: string | null
  slotConfirmedAt: string | null
  roomId: number | null
  moveInDate: string | null      // ADD THIS
  moveOutDate: string | null     // ADD THIS
  reservationFee: number | null
  moveInFee: number | null
  contractMonths: number
  accommodation: {
    id: number
    accommodationName: string
    accommodationType: string
    accommodationLocation: string
    tenantRestriction: string
    primaryImageIndex: number | null
    contractMonths: number
  }
  student: {
    studentNumber: string
    userId: number
    college: string
    degreeProgram: string
    gender: string
    yearLevel: string | null
    user: {
      fname: string
      lname: string
      email: string
      phoneNumbers?: Array<{ contactNumber: string; isPrimary: boolean }>
    }
  }
}

export type RawAssignment = {
  id: number
  studentNumber: string
  moveIn: string
  expectedMoveOut: string
  actualMoveOut: string | null
  confirmationStatus?: string
  room: {
    roomNumber: string
    roomBuilding: string
    roomType: string
    roomStayType: string
    roomRent: number
  }
  student: {
    user: {
      fname: string
      lname: string
    }
  }
}

export type RawRoom = {
  id: number
  roomNumber: string
  roomType: string
  roomStayType: string
  roomBuilding: string
  roomCapacity: number
  roomCurrentOccupancy: number
  roomRent: number
  roomAvailability: string
  tags?: { tagDetail: string }[]
  accommodation?: {
    tenantRestriction: string
  }
}

export type RawLog = {
  id: number
  entityType: string
  entityId: number
  activityType: string
  activityDetails?: string | null
  logTimestamp: string
  actor?: {
    fname: string
    lname: string
    email: string
    role: string
  }
}

// ─── Transformed types ──────────────────────────────────────────────
export type TransformedStudent = {
  fullName: string
  shortName: string
  email: string
  course: string
  college: string
  yearLevel: string
  phone: string
  studentNo: string
  gender: string
  status: string
}

export type TransformedApp = Omit<RawApplication, 'student' | 'accommodation'> & {
  student: TransformedStudent
  stayType: string
  roomType: string
  applicationDate: string
  preferredTags: string[]
  moveInDate: string | null   // Add this
  moveOutDate: string | null  // Add this
  accommodation: {
    building: string
    tenantRestriction: string
  }
}

export type AssignmentItem = {
  applicationId: number          
  student: TransformedApp
  roomNumber: string
  roomBuilding: string
  roomType: string
  stayType: string
  roomRent?: number | null
  moveIn: string
  expectedMoveOut: string
  status: 'assigned' | 'not assigned' | 'pending_confirmation'
}

// ─── Store ──────────────────────────────────────────────────────────
interface DashboardState {
  profile: RawProfile | null
  incomingApps: RawApplication[]
  approvedApps: RawApplication[]
  assignments: RawAssignment[]
  rooms: RawRoom[]
  logs: RawLog[]

  setProfile: (profile: RawProfile) => void
  setIncomingApps: (apps: RawApplication[]) => void
  setApprovedApps: (apps: RawApplication[]) => void
  setAssignments: (assignments: RawAssignment[]) => void
  setRooms: (rooms: RawRoom[]) => void
  setLogs: (logs: RawLog[]) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  profile: null,
  incomingApps: [],
  approvedApps: [],
  assignments: [],
  rooms: [],
  logs: [],

  setProfile: (profile) => set({ profile }),
  setIncomingApps: (incomingApps) => set({ incomingApps }),
  setApprovedApps: (approvedApps) => set({ approvedApps }),
  setAssignments: (assignments) => set({ assignments }),
  setRooms: (rooms) => set({ rooms }),
  setLogs: (logs) => set({ logs }),
}))