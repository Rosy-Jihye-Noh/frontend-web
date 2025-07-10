import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/index';
import { useDashboardStore } from './dashboardStore';

export type Role = 'MEMBER' | 'ADMIN';


// 응답의 메타데이터
export interface LoginResponse {
  user: User;
  token: string;
  success: boolean;
  message: string;
  isSocialLogin: boolean;
}

interface UserStore {
  user: User | null;
  setUser: (userData: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  loginUser: (loginResponse: LoginResponse) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      clearUser: () => {
        console.log('사용자 로그아웃, 모든 데이터 정리');
        localStorage.removeItem('jwt_token');
        
        // 다른 스토어들의 데이터도 정리
        try {
          // dashboard store 데이터 정리
          useDashboardStore.getState().clearUserData();
          
          // localStorage에서 관련 데이터 정리
          localStorage.removeItem('dashboard-storage');
          localStorage.removeItem('log-storage');
        } catch (error) {
          console.warn('스토어 정리 중 오류:', error);
        }
        
        set({ user: null });
      },
      loginUser: (loginResponse) => {
        // JWT 토큰을 localStorage에 저장
        if (loginResponse.token) {
          localStorage.setItem('jwt_token', loginResponse.token);
        }
        // 유저 정보를 store에 저장
        set({ user: loginResponse.user });
      },
    }),
    {
      name: 'user-storage', // localStorage에 저장되는 key
    }
  )
);
