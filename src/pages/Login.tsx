import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { login } from "@/api/authApi"; // 로그인 API 함수
import type { LoginRequest } from "@/types/auth"; // 로그인 요청 타입 정의
import { useUserStore } from "@/store/userStore";

// LoginPage 함수형 컴포넌트
const LoginPage = () => {
  const [email, setEmail] = useState(""); // 이메일 입력 상태
  const [password, setPassword] = useState(""); // 비밀번호 입력 상태
  const { loginUser } = useUserStore(); // userStore에서 로그인 사용자 처리 함수 가져오기
  const navigate = useNavigate(); // 페이지 이동 함수
  const location = useLocation(); // 현재 라우트의 location 객체

  // 로그인 후 돌아갈 페이지 설정: `location.state.from`에 값이 있으면 그 경로로, 없으면 '/dashboard'가 기본값
  const from = location.state?.from || '/dashboard';

  /**
   * 로그인 버튼 클릭 시 또는 Enter 키 입력 시 호출되는 로그인 처리 핸들러입니다.
   */
  const handleLogin = async () => {
    // 이메일 또는 비밀번호가 입력되지 않았을 경우 경고 메시지 표시
    if (!email || !password) {
      alert("🤔 이메일과 비밀번호를 입력해주세요!");
      return;
    }

    // 로그인 요청 데이터 객체 생성
    const loginData: LoginRequest = { email, password };

    try {
      // `login` API를 호출하여 로그인 시도
      const response = await login(loginData);
      const responseData = response.data; // API 응답 데이터

      if (responseData.success) { // 로그인이 성공했을 경우
        // `loginUser` 함수를 사용하여 통합 로그인 처리 (사용자 정보 및 토큰 저장)
        const loginResponse = {
          user: { // 사용자 기본 정보
            id: responseData.user.id,
            name: responseData.user.name,
            role: responseData.user.role,
            goal: '', // 초기 로그인 시에는 목표 정보가 없을 수 있음
            profileImageUrl: null // 초기 로그인 시에는 프로필 이미지 URL이 없을 수 있음
          },
          token: responseData.token, // JWT 토큰
          success: responseData.success, // 성공 여부
          message: responseData.message, // 응답 메시지
          isSocialLogin: false // 소셜 로그인이 아님을 명시
        };
        
        loginUser(loginResponse); // 전역 상태에 로그인 정보 저장
        
        // 사용자의 역할(role)에 따라 다른 페이지로 이동
        // 역할이 'ADMIN'이면 '/admin' 페이지로 이동, 그 외에는 원래 목적지(`from`)로 이동
        const targetPath = responseData.user.role === 'ADMIN' ? '/admin' : from;
        navigate(targetPath); // 페이지 이동
        alert(`🎉 로그인 성공!\n환영합니다, ${responseData.user.name}님!`); // 성공 알림
      } else {
        alert(`❌ 로그인 실패: ${responseData.message}`); // 실패 메시지 표시
      }
    } catch (err: any) {
      console.error("로그인 실패:", err); // 콘솔에 상세 에러 로깅
      const errorMessage = err.response?.data?.message || "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      alert(`🚨 ${errorMessage}`); // 사용자에게 에러 알림
    }
  };

  /**
   * 아이디/비밀번호 찾기 페이지로 이동하는 함수입니다.
   * 어떤 탭을 초기 활성화할지 `state`를 통해 전달합니다.
   * @param tab - 이동할 탭 ('find-email' 또는 'find-password')
   */
  const goToFindCredentials = (tab: 'find-email' | 'find-password') => {
    navigate('/find-credentials', { state: { initialTab: tab } }); // `initialTab`을 state로 전달하며 페이지 이동
  };

  // 컴포넌트 렌더링
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
      {/* 앱 로고/제목 (클릭 시 홈으로 이동) */}
      <h1 className="text-3xl font-extrabold text-blue-600 mb-8 cursor-pointer" onClick={() => navigate('/')}>SynergyM</h1>
      <Card className="w-full max-w-md p-8"> {/* 카드 컨테이너: 최대 너비, 패딩 */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          로그인
        </h2>
        <div className="space-y-6"> {/* 입력 필드 및 버튼들의 세로 간격 */}
          {/* 이메일 입력 필드 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              이메일
            </label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // 입력 값 변경 시 이메일 상태 업데이트
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} // Enter 키 입력 시 로그인 처리
              className="bg-white dark:bg-transparent dark:text-white"
            />
          </div>
          {/* 비밀번호 입력 필드 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              비밀번호
            </label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // 입력 값 변경 시 비밀번호 상태 업데이트
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} // Enter 키 입력 시 로그인 처리
              className="bg-white dark:bg-transparent dark:text-white"
            />
          </div>
          {/* 로그인 버튼 */}
          <Button
            onClick={handleLogin} // 클릭 시 로그인 처리 핸들러 호출
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md"
          >
            로그인
          </Button>

          {/* 구분선 및 "Or continue with" 텍스트 */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" /> {/* 가로선 */}
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground dark:bg-gray-800">
                Or continue with
              </span>
            </div>
          </div>
          {/* 소셜 로그인 버튼들 */}
          <div className="grid grid-cols-2 gap-4">
              {/* Google 소셜 로그인 */}
              <Button variant="outline" asChild>
                  <a href="http://localhost:8081/oauth2/authorization/google">Google</a>
              </Button>
              {/* Naver 소셜 로그인 */}
              <Button variant="outline" asChild>
                  <a href="http://localhost:8081/oauth2/authorization/naver">Naver</a>
              </Button>
              {/* Kakao 소셜 로그인 */}
              <Button variant="outline" asChild>
                  <a href="http://localhost:8081/oauth2/authorization/kakao">Kakao</a>
              </Button>
          </div>
          
          {/* 아이디/비밀번호 찾기 링크 */}
          <div className="text-sm text-center text-gray-600 dark:text-gray-400 flex justify-center items-center space-x-2 pt-2">
            <span
              onClick={() => goToFindCredentials('find-email')} // 클릭 시 아이디 찾기 탭으로 이동
              className="hover:underline cursor-pointer"
            >
              아이디 찾기
            </span>
            <span className="text-gray-400 dark:text-gray-600">|</span> {/* 구분선 */}
            <span
              onClick={() => goToFindCredentials('find-password')} // 클릭 시 비밀번호 찾기 탭으로 이동
              className="hover:underline cursor-pointer"
            >
              비밀번호 찾기
            </span>
          </div>
        </div>
      </Card>
      {/* 회원가입 안내 및 링크 */}
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        아직 계정이 없으신가요?{" "}
        <span
          onClick={() => navigate("/signup")} // 클릭 시 회원가입 페이지로 이동
          className="font-semibold text-blue-600 hover:underline cursor-pointer"
        >
          회원가입
        </span>
      </p>
    </div>
  );
};

export default LoginPage;