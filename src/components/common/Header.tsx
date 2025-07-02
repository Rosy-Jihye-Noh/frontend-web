import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  showAuthButtons?: boolean; // 로그인/회원가입 버튼 노출 여부 (기본값 true)
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  showAuthButtons = true,
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-200">
      <div className="container mx-auto px-4 py-2 md:py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-2 text-gray-500 text-xl font-bold"
              aria-label="뒤로가기"
            >
              ←
            </button>
          )}
          {title ? (
            <h1 className="text-lg md:text-xl font-bold text-gray-900 select-none">
              {title}
            </h1>
          ) : (
            <h1
              className="text-lg md:text-xl font-bold text-blue-600 cursor-pointer select-none"
              onClick={() => navigate("/")}
            >
              Health AI
            </h1>
          )}
        </div>
        {showAuthButtons && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="px-3 py-2 text-sm md:px-4 md:py-2.5 md:text-base font-medium text-gray-700 hover:scale-105"
              onClick={() => navigate("/login")}
            >
              로그인
            </Button>
            <Button
              className="bg-blue-600 text-white hover:scale-105 hover:bg-blue-700 px-3 py-2 text-sm md:px-4 md:py-2.5 md:text-base font-medium"
              onClick={() => navigate("/signup")}
            >
              회원가입
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
