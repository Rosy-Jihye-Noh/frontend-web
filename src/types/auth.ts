// 백엔드의 DTO와 일치하는 프론트엔드 타입을 정의합니다.

/**
 * 사용자 정보 타입
 */
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'MEMBER' | 'ADMIN';
}

/**
 * 로그인 요청 시 사용될 타입
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * 회원가입 요청 시 사용될 타입
 */
export interface SignupRequest {
    email: string;
    password: string;
    name: string;
    goal?: string; // 선택적 필드는 '?'를 붙입니다.
    birthday: string; // 'yyyy-MM-dd' 형식의 문자열
    gender: string;
    weight?: number;
    height?: number;
}

/**
 * 비밀번호 변경 요청 시 사용될 타입
 */
export interface ChangePasswordRequest {
    email: string;
    newPassword: string;
}

/**
 * 로그인 성공 시 백엔드로부터 받는 응답 타입
 */
export interface LoginResponse {
    user: User;
    token: string;
    success: boolean;
    message: string;
}

export interface FindEmailRequest {
  name: string;
  birthday: string; // 'yyyy-MM-dd'
}

export interface SocialSignupRequest {
  email: string;
  name: string;
  goal?: string;
  birthday: string;
  gender: string;
  provider: string; // 로그인 타입
  weight?: number;
  height?: number;
}