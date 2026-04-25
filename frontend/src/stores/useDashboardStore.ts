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

export type RawApplication = {
  id: number
  studentNumber: string
  accommodationId: number
  applicationRoomType: string
  applicationStayType: string
  applicationStatus: string
  durationOfStayDays: number
  applicationDate: string
  rejectionReason?: string | null
  preferredTags?: string[] | string | null
  student: {
    studentNumber: string
    degreeProgram: string
    college: string
    yearLevel: string
    gender: string
    user: {
      fname: string
      lname: string
      email: string
      phoneNumbers?: { contactNumber: string; isPrimary: boolean }[]
    }
  }
  accommodation: {
    accommodationName: string
    tenantRestriction: string
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
  accommodation: {
    building: string
    tenantRestriction: string
  }
}

export type AssignmentItem = {
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