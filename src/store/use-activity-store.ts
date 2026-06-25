import { create } from "zustand";
import { WorkspaceActivityWithProfile } from "@/types/activity";

interface ActivityState {
  activities: WorkspaceActivityWithProfile[];
  isLoading: boolean;
  setActivities: (activities: WorkspaceActivityWithProfile[]) => void;
  addActivity: (activity: WorkspaceActivityWithProfile) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  isLoading: true,
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) =>
    set((state) => ({
      // Insert new activity at the beginning and sort by created_at descending
      activities: [activity, ...state.activities].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
