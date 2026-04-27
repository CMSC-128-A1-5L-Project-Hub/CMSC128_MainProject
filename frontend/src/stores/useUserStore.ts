import { create } from 'zustand'

export interface UserProfile {
  id: number
  fname: string
  mname: string | null
  lname: string
  email: string
  role: string
  accountStatus: string | null
  facebookAccount: string | null
  profilePictureUrl: string | null
  phoneNumbers: { contactNumber: string; isPrimary: boolean }[]
  student: {
    studentNumber: string
    college: string
    degreeProgram: string
    gender: string
    yearLevel: string | null
    emergencyContactName: string | null
    emergencyContactNumber: string | null
  } | null
}

interface UserStore {
  user: UserProfile | null
  setUser: (user: UserProfile) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
