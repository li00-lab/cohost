import { create } from "zustand";

export interface TripTab {
  id: string;        // destination key (lowercased), used for dedup
  label: string;     // display name, e.g. "Singapore"
  sessionId: string;
  itinerary: any;
  ui: any;
}

interface CohostState {
  tabs: TripTab[];
  activeTabId: string | null;
  addOrUpdateTab: (tab: TripTab) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
}

export const useCohostStore = create<CohostState>((set) => ({
  tabs: [],
  activeTabId: null,

  addOrUpdateTab: (tab) =>
    set((state) => {
      const exists = state.tabs.some((t) => t.id === tab.id);
      return {
        tabs: exists
          ? state.tabs.map((t) => (t.id === tab.id ? tab : t))
          : [...state.tabs, tab],
        activeTabId: tab.id,
      };
    }),

  setActiveTab: (id) => set({ activeTabId: id }),

  closeTab: (id) =>
    set((state) => {
      const remaining = state.tabs.filter((t) => t.id !== id);
      const nextActive =
        state.activeTabId === id
          ? (remaining[remaining.length - 1]?.id ?? null)
          : state.activeTabId;
      return { tabs: remaining, activeTabId: nextActive };
    }),
}));
