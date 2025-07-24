import { create } from 'zustand';
import { Plan } from '@/types';

interface PlanStoreState {
  plans: Plan[];
  setPlans: (plans: Plan[]) => void;
  getPlans: () => Plan[];
}

export const usePlanStore = create<PlanStoreState>((set, get) => ({
  plans: [],
  setPlans: (plans) => set({ plans }),
  getPlans: () => get().plans,
}));
