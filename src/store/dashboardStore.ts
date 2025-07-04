// src/store/dashboardStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Routine } from '@/types/index';

interface DashboardState {
  todaySelectedRoutines: Routine[];
  setTodaySelectedRoutines: (routines: Routine[]) => void;
  getTodayRoutines: () => Routine[];
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      todaySelectedRoutines: [],
      
      setTodaySelectedRoutines: (routines: Routine[]) => {
        set({ todaySelectedRoutines: routines });
      },
      
      getTodayRoutines: () => {
        return get().todaySelectedRoutines;
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({ 
        todaySelectedRoutines: state.todaySelectedRoutines,
      }),
    }
  )
);
