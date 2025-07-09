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
      
      /**
       * 현재 로그인된 사용자 ID를 설정합니다.
       * 만약 사용자 ID가 변경되면, 이전 사용자의 `todaySelectedRoutines`를 초기화합니다.
       * 이는 여러 사용자가 같은 기기를 사용할 때 데이터 혼동을 방지합니다.
       * @param userId - 새로 설정할 사용자 ID
       */
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
      
      /**
       * 특정 사용자의 오늘 선택된 루틴을 설정하고 저장합니다.
       * 이 루틴은 `todaySelectedRoutines`와 `userRoutines`의 해당 사용자 항목에 저장됩니다.
       * @param routines - 오늘 선택된 루틴 배열
       * @param userId - 루틴을 설정할 사용자의 ID
       */
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
      
      /**
       * 특정 사용자의 오늘 루틴을 가져옵니다.
       * `currentUserId`와 요청된 `userId`가 일치하면 `todaySelectedRoutines`를 반환하고,
       * 그렇지 않으면 `userRoutines`에서 해당 사용자 ID의 루틴을 반환합니다.
       * @param userId - 루틴을 가져올 사용자의 ID
       * @returns {Routine[]} 해당 사용자의 오늘 루틴 배열 또는 빈 배열
       */
      getTodayRoutines: (userId: number) => {
        const { todaySelectedRoutines, currentUserId, userRoutines } = get();
        
        // 현재 사용자의 루틴만 반환
        if (currentUserId === userId) {
          return todaySelectedRoutines;
        }
        
        // 사용자별 저장된 루틴 반환
        return userRoutines[userId] || [];
      },
      
      /**
       * 스토어의 모든 사용자 관련 데이터를 초기화합니다.
       * 주로 로그아웃 시 호출됩니다.
       */
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
      // `partialize`를 사용하여 스토어 상태 중 일부만 영속화
      // `userRoutines`와 `currentUserId`만 로컬 스토리지에 저장하고 복원합니다.
      // `todaySelectedRoutines`는 `userRoutines[currentUserId]`에서 파생되므로 별도로 영속화하지 않아도 됩니다.
      partialize: (state) => ({ 
        userRoutines: state.userRoutines,
        currentUserId: state.currentUserId,
      }),
    }
  )
);
