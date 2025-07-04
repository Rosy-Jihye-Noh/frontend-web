import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';

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
  clearUser: () => void;
  loginUser: (loginResponse: LoginResponse) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      clearUser: () => {
        localStorage.removeItem('jwt_token');
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
