// src/store/dashboardStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Routine } from '@/types/index';

interface DashboardState {
  // 사용자별로 루틴을 저장
  userRoutines: Record<number, Routine[]>; // userId -> routines
  todaySelectedRoutines: Routine[];
  currentUserId: number | null;
  setTodaySelectedRoutines: (routines: Routine[], userId: number) => void;
  getTodayRoutines: (userId: number) => Routine[];
  clearUserData: () => void;
  setCurrentUser: (userId: number) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      userRoutines: {},
      todaySelectedRoutines: [],
      currentUserId: null,
      
      setCurrentUser: (userId: number) => {
        const { currentUserId, userRoutines } = get();
        
        // 사용자가 바뀌면 이전 사용자의 선택된 루틴을 초기화
        if (currentUserId !== userId) {
          console.log('사용자 변경:', currentUserId, '->', userId);
          set({ 
            currentUserId: userId, 
            todaySelectedRoutines: userRoutines[userId]?.slice(0, 0) || [] // 빈 배열로 초기화
          });
        }
      },
      
      setTodaySelectedRoutines: (routines: Routine[], userId: number) => {
        console.log('사용자', userId, '의 루틴 설정:', routines.map(r => r.name));
        
        // 해당 사용자의 루틴만 저장
        set(state => ({
          todaySelectedRoutines: routines,
          currentUserId: userId,
          userRoutines: {
            ...state.userRoutines,
            [userId]: routines
          }
        }));
      },
      
      getTodayRoutines: (userId: number) => {
        const { todaySelectedRoutines, currentUserId, userRoutines } = get();
        
        // 현재 사용자의 루틴만 반환
        if (currentUserId === userId) {
          return todaySelectedRoutines;
        }
        
        // 사용자별 저장된 루틴 반환
        return userRoutines[userId] || [];
      },
      
      clearUserData: () => {
        console.log('사용자 데이터 초기화');
        set({ 
          todaySelectedRoutines: [], 
          currentUserId: null,
          userRoutines: {}
        });
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({ 
        userRoutines: state.userRoutines,
        currentUserId: state.currentUserId,
      }),
    }
  )
);
