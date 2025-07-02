import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import type { User, LoginResponse } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean; // 로딩 상태 추가
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 기본값을 true로 설정

  useEffect(() => {
    try {
      // 페이지 로드 시 localStorage에서 로그인 정보 복원
      const storedData = localStorage.getItem('authData');
      if (storedData) {
        const { user, token } = JSON.parse(storedData);
        setUser(user);
        setToken(token);
      }
    } catch (error) {
      console.error("인증 정보 파싱 실패:", error);
      // 실패 시 로그인 상태 초기화
      localStorage.removeItem('authData');
    } finally {
      // 정보 로딩 시도가 끝나면 로딩 상태를 false로 변경
      setIsLoading(false);
    }
  }, []);

  const login = (data: LoginResponse) => {
    if (data.success && data.user && data.token) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('authData', JSON.stringify({ user: data.user, token: data.token }));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authData');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};