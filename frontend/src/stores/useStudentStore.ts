import { create } from 'zustand'

interface StudentState {
  profile: any | null
  unreadCount: number
  setProfile: (profile: any) => void
  setUnreadCount: (count: number) => void
}

export const useStudentStore = create<StudentState>((set) => ({
  profile: null,
  unreadCount: 0,
  setProfile: (profile) => set({ profile }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
}))
