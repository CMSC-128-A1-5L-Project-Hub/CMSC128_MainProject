import { useQuery } from '@tanstack/react-query'
import { api } from '../src/api/axios'
import { useStudentStore } from '../src/stores/useStudentStore'

// ─── Query keys ──────────────────────────────────────────────────
export const studentKeys = {
  me:          ['me']                       as const,
  profile:     ['student', 'profile']       as const,
  applications:['student', 'applications']  as const,
  notifications:['notifications']           as const,
  recommended: ['student', 'recommended']   as const,
}

// ─── GET /me ─────────────────────────────────────────────────────
// Shared with BillingDashboard — queryKey ['me']
export function useMyProfile() {
  const setProfile = useStudentStore((s) => s.setProfile)
  return useQuery({
    queryKey: studentKeys.me,
    queryFn: async () => {
      const { data } = await api.get('/me')
      const result = data.data ?? data
      setProfile(result)
      return result
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ─── GET /student/profile ────────────────────────────────────────
// Student-specific fields: course, yearLevel, college, studentNo, etc.
export function useStudentProfile() {
  return useQuery({
    queryKey: studentKeys.profile,
    queryFn: async () => {
      const { data } = await api.get('/student/profile')
      return data.data ?? data
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ─── GET /applications/my-applications ───────────────────────────
// Shared between Dashboard and ApplicationStatus
export function useMyApplications() {
  return useQuery({
    queryKey: studentKeys.applications,
    queryFn: async () => {
      const { data } = await api.get('/applications/my-applications')
      return data.data ?? data
    },
    staleTime: 1000 * 60 * 2,
  })
}

// ─── GET /notifications ──────────────────────────────────────────
export function useNotifications() {
  const setUnreadCount = useStudentStore((s) => s.setUnreadCount)
  return useQuery({
    queryKey: studentKeys.notifications,
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      const list: any[] = data.data ?? data
      const unread = list.filter((n) => n.readStatus?.toLowerCase() === 'unread').length
      setUnreadCount(unread)
      return list
    },
    staleTime: 1000 * 60 * 2,
  })
}

// ─── GET /recommended-accommodations ─────────────────────────────
export function useRecommendedDorms() {
  return useQuery({
    queryKey: studentKeys.recommended,
    queryFn: async () => {
      const { data } = await api.get('/recommended-accommodations')
      return data.data ?? data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })
}
