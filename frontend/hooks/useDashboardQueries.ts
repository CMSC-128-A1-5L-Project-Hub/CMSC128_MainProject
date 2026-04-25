import { useQuery, useQueryClient } from '@tanstack/react-query'
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

const BASE = 'http://localhost:3333'

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json()
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const dashboardKeys = {
  all: ['dashboard'] as const,
  profile: () => [...dashboardKeys.all, 'profile'] as const,
  incomingApps: () => [...dashboardKeys.all, 'incomingApps'] as const,
  approvedApps: () => [...dashboardKeys.all, 'approvedApps'] as const,
  assignments: () => [...dashboardKeys.all, 'assignments'] as const,
  rooms: () => [...dashboardKeys.all, 'rooms'] as const,
  logs: () => [...dashboardKeys.all, 'logs'] as const,
}

// ─── Individual Hooks ─────────────────────────────────────────────────────────

export function useProfile() {
  const setProfile = useDashboardStore((s) => s.setProfile)
  return useQuery({
    queryKey: dashboardKeys.profile(),
    queryFn: async () => {
      const json = await fetchJson<any>(`${BASE}/me`)
      const data: RawProfile = json.data ?? json
      setProfile(data)
      return data
    },
  })
}

export function useIncomingApps() {
  const setIncomingApps = useDashboardStore((s) => s.setIncomingApps)
  return useQuery({
    queryKey: dashboardKeys.incomingApps(),
    queryFn: async () => {
      const data = await fetchJson<RawApplication[]>(`${BASE}/applications/incoming`)
      setIncomingApps(data)
      return data
    },
  })
}

export function useApprovedApps() {
  const setApprovedApps = useDashboardStore((s) => s.setApprovedApps)
  return useQuery({
    queryKey: dashboardKeys.approvedApps(),
    queryFn: async () => {
      const data = await fetchJson<RawApplication[]>(`${BASE}/manager/applications/approved`)
      setApprovedApps(data)
      return data
    },
  })
}

export function useAssignments() {
  const setAssignments = useDashboardStore((s) => s.setAssignments)
  return useQuery({
    queryKey: dashboardKeys.assignments(),
    queryFn: async () => {
      const data = await fetchJson<RawAssignment[]>(`${BASE}/manager/assignments`)
      setAssignments(data)
      return data
    },
  })
}

export function useRooms() {
  const setRooms = useDashboardStore((s) => s.setRooms)
  return useQuery({
    queryKey: dashboardKeys.rooms(),
    queryFn: async () => {
      const data = await fetchJson<RawRoom[]>(`${BASE}/manager/rooms`)
      setRooms(data)
      return data
    },
  })
}

export function useLogs() {
  const setLogs = useDashboardStore((s) => s.setLogs)
  return useQuery({
    queryKey: dashboardKeys.logs(),
    queryFn: async () => {
      const data = await fetchJson<RawLog[]>(`${BASE}/manager/logs`)
      setLogs(data)
      return data
    },
  })
}

// ─── Invalidation helper (replaces loadData()) ────────────────────────────────

export function useRefreshDashboard() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
}

// ─── Shared Transformations ───────────────────────────────────────────────────

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
  try { return JSON.parse(raw) } catch { return [] }
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