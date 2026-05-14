import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../src/api/axios'
import { useDashboardStore } from '../src/stores/useDashboardStore'
import type {
  RawProfile,
  RawApplication,
  RawAssignment,
  RawRoom,
  RawLog,
  TransformedApp,
  AssignmentItem,
} from '../src/stores/useDashboardStore'

const fetchProfile = async (): Promise<RawProfile> => {
  const { data } = await api.get('/me')
  return data.data ?? data
}

const fetchIncomingApps = async (): Promise<RawApplication[]> => {
  const { data } = await api.get('/applications/incoming')
  return data.data ?? data
}

const fetchApprovedApps = async (): Promise<RawApplication[]> => {
  const { data } = await api.get('/manager/applications/approved')
  return data.data ?? data
}

const fetchAssignments = async (): Promise<RawAssignment[]> => {
  const { data } = await api.get('/manager/assignments')
  return data.data ?? data
}

const fetchRooms = async (): Promise<RawRoom[]> => {
  const { data } = await api.get('/manager/rooms')
  return data.data ?? data
}

const fetchLogs = async (): Promise<RawLog[]> => {
  const { data } = await api.get('/manager/logs')
  return data.data ?? data
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  profile: () => [...dashboardKeys.all, 'profile'] as const,
  incomingApps: () => [...dashboardKeys.all, 'incomingApps'] as const,
  approvedApps: () => [...dashboardKeys.all, 'approvedApps'] as const,
  assignments: () => [...dashboardKeys.all, 'assignments'] as const,
  rooms: () => [...dashboardKeys.all, 'rooms'] as const,
  logs: () => [...dashboardKeys.all, 'logs'] as const,
}

export function useProfile() {
  const setProfile = useDashboardStore((s) => s.setProfile)
  return useQuery({
    queryKey: dashboardKeys.profile(),
    queryFn: async () => {
      const user = await fetchProfile()
      setProfile(user)
      return user
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useIncomingApps() {
  const setIncomingApps = useDashboardStore((s) => s.setIncomingApps)
  return useQuery({
    queryKey: dashboardKeys.incomingApps(),
    queryFn: async () => {
      const apps = await fetchIncomingApps()
      setIncomingApps(apps)
      return apps
    },
    staleTime: 0, // Always fetch fresh
  })
}

export function useApprovedApps() {
  const setApprovedApps = useDashboardStore((s) => s.setApprovedApps)
  return useQuery({
    queryKey: dashboardKeys.approvedApps(),
    queryFn: async () => {
      const apps = await fetchApprovedApps()
      setApprovedApps(apps)
      return apps
    },
    staleTime: 0, // Always fetch fresh
  })
}

export function useAssignments() {
  const setAssignments = useDashboardStore((s) => s.setAssignments)
  return useQuery({
    queryKey: dashboardKeys.assignments(),
    queryFn: async () => {
      const assignments = await fetchAssignments()
      setAssignments(assignments)
      return assignments
    },
    staleTime: 0, // Always fetch fresh
  })
}

export function useRooms() {
  const setRooms = useDashboardStore((s) => s.setRooms)
  return useQuery({
    queryKey: dashboardKeys.rooms(),
    queryFn: async () => {
      const rooms = await fetchRooms()
      setRooms(rooms)
      return rooms
    },
    staleTime: 0, // Always fetch fresh
  })
}

export function useLogs() {
  const setLogs = useDashboardStore((s) => s.setLogs)
  return useQuery({
    queryKey: dashboardKeys.logs(),
    queryFn: async () => {
      const logs = await fetchLogs()
      setLogs(logs)
      return logs
    },
    staleTime: 60_000,
  })
}

export function useRefreshDashboard() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
  }
}

export function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function parsePreferredTags(raw: string[] | string | null | undefined): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function transformApp(app: RawApplication): TransformedApp {
  const s = app.student
  const u = s.user
  return {
    ...app,
    student: {
      fullName: `${u.fname} ${u.lname}`,
      shortName: u.fname,
      email: u.email,
      course: s.degreeProgram,
      college: s.college,
      yearLevel: s.yearLevel,
      phone:
        u.phoneNumbers?.find((p) => p.isPrimary)?.contactNumber ??
        u.phoneNumbers?.[0]?.contactNumber ??
        '',
      studentNo: s.studentNumber,
      gender: s.gender,
      status: 'active',
    },
    accommodation: {
      ...app.accommodation,
      building: app.accommodation.accommodationName,
      tenantRestriction: app.accommodation.tenantRestriction,
    },
    stayType: app.applicationStayType?.replace('_', '-'),
    roomType: app.applicationRoomType,
    applicationDate: formatDate(app.applicationDate),
    preferredTags: parsePreferredTags(app.preferredTags),
  }
}

export function mergeAppWithAssignment(
  app: TransformedApp,
  assignments: RawAssignment[]
): AssignmentItem {
  const activeAssign = assignments.find(
    (a) => a.studentNumber === app.student.studentNo && !a.actualMoveOut
  )
  if (activeAssign) {
    const confirmationStatus = activeAssign.confirmationStatus ?? 'pending_confirmation'
    return {
      applicationId: app.id,
      student: app,
      roomNumber: activeAssign.room.roomNumber,
      roomBuilding: activeAssign.room.roomBuilding,
      roomType: activeAssign.room.roomType,
      stayType: activeAssign.room.roomStayType,
      roomRent: activeAssign.room.roomRent,
      moveIn: activeAssign.moveIn,
      expectedMoveOut: activeAssign.expectedMoveOut,
      status: confirmationStatus === 'active' ? 'assigned' : 'pending_confirmation',
    }
  }
  return {
    applicationId: app.id,
    student: app,
    roomNumber: '',
    roomBuilding: '',
    roomType: app.applicationRoomType,
    stayType: app.applicationStayType?.replace('_', '-'),
    roomRent: null,
    moveIn: '',
    expectedMoveOut: '',
    status: 'not assigned',
  }
}