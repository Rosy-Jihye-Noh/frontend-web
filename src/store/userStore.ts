import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum Role {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
  }

// user 필드
export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

// 응답의 메타데이터
export interface LoginResponse {
  user: User;
  token: string;
  success: boolean;
  message: string;
}

interface UserStore {
  user: User | null;
  setUser: (userData: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage', // localStorage에 저장되는 key
    }
  )
);
