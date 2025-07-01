import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // URL 쿼리 파라미터에서 'token'을 추출합니다.
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
            console.log("소셜 로그인 성공. JWT 토큰:", token);
            // JWT 토큰을 localStorage에 저장합니다.
            localStorage.setItem('jwt_token', token);
            // 유저를 메인 페이지로 리디렉션합니다.
            navigate('/');
        } else {
            // 토큰이 없는 경우, 에러 처리 후 로그인 페이지로 리디렉션합니다.
            console.error("소셜 로그인 실패: 토큰이 없습니다.");
            navigate('/login');
        }
    }, [location, navigate]);

    // 리디렉션 중에는 로딩 인디케이터를 보여줍니다.
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>로그인 중입니다...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;
