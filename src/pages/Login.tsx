import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { login } from "@/api/authApi";
import type { LoginRequest } from "@/types/auth";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("🤔 이메일과 비밀번호를 입력해주세요!");
      return;
    }

    const loginData: LoginRequest = { email, password };

    try {
      const response = await login(loginData);
      const responseData = response.data;

      if (responseData.success) {
        localStorage.setItem('jwt_token', responseData.token);
        alert(`🎉 로그인 성공!\n환영합니다!`);
        navigate("/");
      } else {
        alert(`❌ 로그인 실패: ${responseData.message}`);
      }
    } catch (err: any) {
      console.error("로그인 실패:", err);
      const errorMessage = err.response?.data?.message || "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      alert(`🚨 ${errorMessage}`);
    }
  };

  /**
   * 아이디/비밀번호 찾기 페이지로 이동하는 함수
   * @param tab 이동 후 활성화할 탭의 이름 ('find-email' 또는 'find-password')
   */
  const goToFindCredentials = (tab: 'find-email' | 'find-password') => {
    // navigate 함수의 state 옵션을 사용하여 이동할 페이지에 데이터를 전달합니다.
    navigate('/find-credentials', { state: { initialTab: tab } });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-extrabold text-blue-600 mb-8">SynergyM</h1>
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          로그인
        </h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              이메일
            </label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-white dark:bg-transparent dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              비밀번호
            </label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-white dark:bg-transparent dark:text-white"
            />
          </div>
          <Button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md"
          >
            로그인
          </Button>

          {/* [추가된 부분] 아이디/비밀번호 찾기 링크 */}
          <div className="text-sm text-center text-gray-600 dark:text-gray-400 flex justify-center items-center space-x-2 pt-2">
            <span
              onClick={() => goToFindCredentials('find-email')}
              className="hover:underline cursor-pointer"
            >
              아이디 찾기
            </span>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <span
              onClick={() => goToFindCredentials('find-password')}
              className="hover:underline cursor-pointer"
            >
              비밀번호 찾기
            </span>
          </div>

        </div>
      </Card>
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        아직 계정이 없으신가요?{" "}
        <span
          onClick={() => navigate("/signup")}
          className="font-semibold text-blue-600 hover:underline cursor-pointer"
        >
          회원가입
        </span>
      </p>
    </div>
  );
};

export default LoginPage;
