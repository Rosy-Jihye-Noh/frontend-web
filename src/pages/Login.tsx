import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { login } from "@/api/authApi";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email && !password) return alert("🤔 이메일과 비밀번호를 입력해주세요!");
    if (!email) return alert("📧 이메일을 입력해주세요!");
    if (!password) return alert("🔐 비밀번호를 입력해주세요!");

    try {
      const response = await login({ email, password });

      if (response.success) {
        alert(`🎉 로그인 성공!\n환영합니다!`);
        navigate("/");
      } else {
        alert(`❌ 로그인 실패: ${response.message}`);
      }
    } catch (err) {
      console.error("로그인 실패", err);
      alert("🚨 서버 오류 또는 네트워크 문제입니다.");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-extrabold text-blue-600 mb-8">Health AI</h1>
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
