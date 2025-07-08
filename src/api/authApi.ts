import axiosInstance from './axiosInstance';
import type { SocialSignupRequest, LoginRequest, SignupRequest, ChangePasswordRequest, LoginResponse, FindEmailRequest } from '@/types/auth';

// 이메일 존재 여부 확인
export const checkEmailExists = (email: string) => {
    return axiosInstance.get<{ exists: boolean }>(`/auth/check-email`, { params: { email } });
};

// 회원가입
export const signup = (signupData: SignupRequest, profileImage?: File) => {
    const formData = new FormData();
    formData.append('signupRequest', new Blob([JSON.stringify(signupData)], { type: "application/json" }));
    if (profileImage) {
        formData.append('profileImage', profileImage);
    }
    return axiosInstance.post('/auth/signup', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};

// 로그인
export const login = (loginData: LoginRequest) => {
    return axiosInstance.post<LoginResponse>('/auth/login', loginData);
};

// 인증번호 발송
export const sendVerificationCode = (email: string) => {
    return axiosInstance.post('/auth/send-verification', { email });
};

// 인증번호 검증
export const verifyCode = (email: string, code: string) => {
    return axiosInstance.post<{ verified: boolean }>('/auth/verify-code', { email, code });
};

// 비밀번호 변경
export const changePassword = (passwordData: ChangePasswordRequest) => {
    return axiosInstance.post('/auth/change-password', passwordData);
};

// 이메일 찾기
export const findEmail = (findData: FindEmailRequest) => {
    // 백엔드는 이메일 주소를 텍스트로 바로 반환하므로, 응답 타입을 string으로 지정
    return axiosInstance.post<string>('/auth/find-email', findData);
};

export const getCurrentUser = () => {
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
        throw new Error('JWT 토큰이 없습니다.');
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.sub || payload.email; // 토큰에서 이메일 추출
        
        if (!email) {
            throw new Error('토큰에서 이메일을 찾을 수 없습니다.');
        }
        
        // axiosInstance를 사용하면 인터셉터에서 자동으로 Authorization 헤더가 추가됩니다
        return axiosInstance.get(`/users/social/${email}`);
    } catch (error) {
        throw new Error('JWT 토큰 파싱에 실패했습니다.');
    }
};

// 소셜 회원가입 완료 요청
export const socialSignup = (signupData: SocialSignupRequest) => {
    return axiosInstance.post<LoginResponse>('/auth/social-signup', signupData);
};

// interface LoginRequest {
//   email: string;
//   password: string;
// }

// interface LoginResponse {
//   success: boolean;
//   message: string;
//   id: number;
// }


// export const login = async (data: LoginRequest): Promise<LoginResponse> => {
//   console.log(data);
//   const response = await axios.post<LoginResponse>('/auth/login', data);
//   return response.data
// }