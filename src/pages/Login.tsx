import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-extrabold text-blue-600 mb-8">Health AI</h1>
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          로그인
        </h2>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="email@example.com"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              navigate("dashboard");
            }}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md"
          >
            로그인
          </Button>
        </form>
      </Card>
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        아직 계정이 없으신가요?{" "}
        <span
          onClick={() => navigate("signup")}
          className="font-semibold text-blue-600 hover:underline cursor-pointer"
        >
          회원가입
        </span>
      </p>
    </div>
  );
};

export default LoginPage;
