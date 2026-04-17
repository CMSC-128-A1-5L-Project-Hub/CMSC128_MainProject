import { create } from 'zustand'

interface AccommodationFilterState {
  // ─── ACCOMMODATION FILTERS ───
  dormType: string        // 'on-campus' | 'off-campus' | 'partner_housing' | ''
  maxWalk: string         // e.g., '500' (meters)
  tags: string[]          // e.g., ['air-con', 'wifi']

  // ─── ROOM FILTERS ───
  roomType: string        // 'single' | 'double' | 'shared' | ''
  stayType: string        // 'transient' | 'non_transient' | ''
  minPrice: string
  maxPrice: string

  // ─── ACTIONS ───
  setDormType: (type: string) => void
  setMaxWalk: (distance: string) => void
  
  // Tag handling (Toggle tags on and off)
  toggleTag: (tag: string) => void
  
  setRoomType: (type: string) => void
  setStayType: (type: string) => void
  setPriceRange: (min: string, max: string) => void
  clearAllFilters: () => void
}

export const useAccommodationStore = create<AccommodationFilterState>((set) => ({
  dormType: '',
  maxWalk: '',
  tags: [],
  roomType: '',
  stayType: '',
  minPrice: '',
  maxPrice: '',

  setDormType: (type) => set({ dormType: type }),
  setMaxWalk: (distance) => set({ maxWalk: distance }),
  
  // Smart Toggle: If the tag is already in the array, remove it. If not, add it!
  toggleTag: (tag) => set((state) => ({
    tags: state.tags.includes(tag) 
      ? state.tags.filter(t => t !== tag) 
      : [...state.tags, tag]
  })),

  setRoomType: (type) => set({ roomType: type }),
  setStayType: (type) => set({ stayType: type }),
  setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),

  clearAllFilters: () => set({
    dormType: '', maxWalk: '', tags: [], roomType: '', stayType: '', minPrice: '', maxPrice: ''
  })
}))