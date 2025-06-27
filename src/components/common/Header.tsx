import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-200">
      <div className="container mx-auto px-4 py-2 md:py-3 flex justify-between items-center">
        {/* 로고 */}
        <h1
          className="text-lg md:text-xl font-bold text-blue-600 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          Health AI
        </h1>

        {/* 버튼 영역 */}
        <div className="flex items-center gap-2">
          {/* 로그인 버튼 */}
          <Button
            variant="ghost"
            className="px-3 py-2 text-sm md:px-4 md:py-2.5 md:text-base font-medium text-gray-700 hover:scale-105"
            onClick={() => navigate("/")}
          >
            로그인
          </Button>

          {/* 회원가입 버튼 */}
          <Button
            className="bg-blue-600 text-white hover:scale-105 hover:bg-blue-700 px-3 py-2 text-sm md:px-4 md:py-2.5 md:text-base font-medium"
            onClick={() => navigate("/")}
          >
            회원가입
          </Button>

        </div>
      </div>
    </header>
  );
};

export default Header;
