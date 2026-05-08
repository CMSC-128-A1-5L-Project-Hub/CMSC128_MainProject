// src/stores/useSidebarStore.ts
import { create } from "zustand";

type SidebarRole = "student" | "landlord" | "manager" | "landlord-manage";

interface SidebarState {
  currentRole: SidebarRole | null;
  setSidebarRole: (role: SidebarRole | null) => void;
  clearSidebarRole: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  currentRole: null,
  setSidebarRole: (role) => set({ currentRole: role }),
  clearSidebarRole: () => set({ currentRole: null }),
}));