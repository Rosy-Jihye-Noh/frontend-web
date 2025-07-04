import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { getCurrentUser } from '@/api/authApi';

const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginUser } = useUserStore();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
            console.log("소셜 로그인 성공. JWT 토큰:", token);
            
            // JWT 토큰을 localStorage에 저장
            localStorage.setItem('jwt_token', token);
            
            // 토큰을 사용해서 유저 정보 가져오기
            getCurrentUser()
                .then((response) => {
                    const user = response.data;
                    
                    // LoginResponse 형태로 데이터 구성
                    const loginResponse = {
                        user: user,
                        token: token,
                        success: true,
                        message: "소셜 로그인 성공",
                        isSocialLogin: true
                    };
                    
                    loginUser(loginResponse);
                    navigate('/dashboard');
                })
                .catch((error) => {
                    console.error("유저 정보 가져오기 실패:", error);
                });
        } else {
            console.error("소셜 로그인 실패: 토큰이 없습니다.");
            navigate('/login');
        }
    }, [location, navigate, loginUser]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>로그인 중입니다...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;
