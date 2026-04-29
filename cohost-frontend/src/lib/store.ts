import { create } from "zustand";

interface CohostState {
  itinerary: any;
  ui: any;
  setData: (data: { itinerary: any; ui: any }) => void;
}

export const useCohostStore = create<CohostState>((set) => ({
  itinerary: null,
  ui: null,
  setData: (data) => set(data),
}));
