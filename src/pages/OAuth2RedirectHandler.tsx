import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { getCurrentUser } from '@/api/authApi'; // 현재 사용자 정보를 가져오는 API 함수 임포트

// OAuth2RedirectHandler 함수형 컴포넌트
const OAuth2RedirectHandler = () => {
    const location = useLocation(); // 현재 URL의 location 객체
    const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수
    const { loginUser } = useUserStore(); // userStore에서 로그인 사용자 처리 함수 가져오기

    // 컴포넌트가 마운트될 때 한 번 실행되는 useEffect 훅
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token'); // 'token' 쿼리 파라미터 값(JWT)을 가져옵니다.

        // JWT 토큰이 존재할 경우
        if (token) {
            console.log("소셜 로그인 성공. JWT 토큰:", token); // 콘솔에 성공 메시지와 토큰 로깅
            
            // 획득한 JWT 토큰을 localStorage에 저장합니다.
            localStorage.setItem('jwt_token', token);
            
            // 저장된 토큰을 사용하여 현재 로그인한 사용자 정보를 백엔드에서 가져옵니다.
            getCurrentUser()
                .then((response) => {
                    const user = response.data; // API 응답에서 사용자 데이터 추출
                    
                    // UserStore의 `loginUser` 함수에 전달할 LoginResponse 형태의 데이터를 구성합니다.
                    const loginResponse = {
                        user: user,             // 서버에서 가져온 사용자 객체
                        token: token,           // 소셜 로그인으로 받은 JWT 토큰
                        success: true,          // 로그인 성공 여부
                        message: "소셜 로그인 성공", // 메시지
                        isSocialLogin: true     // 소셜 로그인을 통해 로그인했음을 표시
                    };
                    
                    // 구성된 데이터를 `loginUser` 함수에 전달하여 전역 사용자 상태를 업데이트합니다.
                    loginUser(loginResponse);
                    
                    // 사용자의 역할(role)에 따라 다른 페이지로 이동합니다.
                    // 역할이 'ADMIN'이면 '/admin' 페이지로 이동하고, 그 외에는 '/dashboard'로 이동합니다.
                    const targetPath = user.role === 'ADMIN' ? '/admin' : '/dashboard';
                    navigate(targetPath); // 해당 경로로 페이지 이동
                })
                .catch((error) => {
                    // 유저 정보를 가져오는 데 실패했을 경우
                    console.error("유저 정보 가져오기 실패:", error); // 콘솔에 에러 로깅
                    // 로그인 페이지로 다시 이동하여 오류를 처리하거나 재시도를 유도합니다.
                    navigate('/login'); 
                });
        } else {
            // JWT 토큰이 URL에 없는 경우 (소셜 로그인 실패 또는 비정상적인 접근)
            console.error("소셜 로그인 실패: 토큰이 없습니다."); // 콘솔에 에러 로깅
            // 로그인 페이지로 리다이렉트합니다.
            navigate('/login');
        }
    }, [location, navigate, loginUser]); // `location`, `Maps`, `loginUser`가 변경될 때마다 이펙트 재실행

    // 토큰 처리 및 유저 정보 로딩 중 사용자에게 표시할 간단한 UI
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>로그인 중입니다... 🔄</p>
        </div>
    );
};

export default OAuth2RedirectHandler;