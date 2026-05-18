import { create } from 'zustand'

interface AccommodationFormState {
  // ─── Step 1 Fields ──────────────────────────────────────────────
  accommodationName: string
  accommodationType: 'on-campus' | 'off-campus' | 'partner_housing' | ''
  accommodationLocation: string
  tenantRestriction: 'male-only' | 'female-only' | 'coed' | ''
  accommodationCapacity: string
  contractMonths: string  // Changed from number to string for typable input
  businessPermit: File | null

  // ─── Location (hidden from UI, sent to backend) ─────────────────
  latitude: number | null
  longitude: number | null

  // ─── Step 2 Fields ──────────────────────────────────────────────
  images: File[]
  imagePreviews: string[]
  primaryImageIndex: number

  // ─── Actions ────────────────────────────────────────────────────
  setField: <K extends keyof AccommodationFormState>(key: K, value: AccommodationFormState[K]) => void
  setLocation: (address: string, lat: number, lng: number) => void
  setBusinessPermit: (file: File | null) => void
  addImages: (files: File[]) => void
  removeImage: (index: number) => void
  setPrimaryImage: (index: number) => void
  reset: () => void
}

const initialState = {
  accommodationName: '',
  accommodationType: '' as const,
  accommodationLocation: '',
  tenantRestriction: '' as const,
  accommodationCapacity: '',
  contractMonths: '',  // Empty string, user will type
  businessPermit: null,
  latitude: null,
  longitude: null,
  images: [],
  imagePreviews: [],
  primaryImageIndex: 0,
}

export const useAccommodationFormStore = create<AccommodationFormState>((set) => ({
  ...initialState,

  setField: (key, value) => set((state) => ({ ...state, [key]: value })),

  setLocation: (address, lat, lng) =>
    set({ accommodationLocation: address, latitude: lat, longitude: lng }),

  setBusinessPermit: (file) => set({ businessPermit: file }),

  addImages: (files) =>
    set((state) => {
      const newPreviews = files.map((f) => URL.createObjectURL(f))
      return {
        images: [...state.images, ...files],
        imagePreviews: [...state.imagePreviews, ...newPreviews],
      }
    }),

  removeImage: (index) =>
    set((state) => {
      URL.revokeObjectURL(state.imagePreviews[index])
      const newImages = state.images.filter((_, i) => i !== index)
      const newPreviews = state.imagePreviews.filter((_, i) => i !== index)
      const newPrimary =
        index === state.primaryImageIndex ? 0
        : index < state.primaryImageIndex ? state.primaryImageIndex - 1
        : state.primaryImageIndex
      return {
        images: newImages,
        imagePreviews: newPreviews,
        primaryImageIndex: Math.max(0, newPrimary),
      }
    }),

  setPrimaryImage: (index) => set({ primaryImageIndex: index }),

  reset: () => set(initialState),
}))