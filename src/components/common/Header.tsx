import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserStore } from '@/store/userStore';
import { HiMenu, HiX } from "react-icons/hi";
import MobileMenuModal from './MobileMenuModal';

const menus = [
  { name: "홈", path: "/dashboard" },
  { name: "커뮤니티", path: "/posts" },
  { name: "운동 목록", path: "/exercises" },
  { name: "운동 기록", path: "/exercise-logs" },
];

const Header: React.FC = () => {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // 메뉴 클릭 시 닫기
  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-200">
      <div className="container mx-auto px-4 py-2 [@media(min-width:1025px)]:py-3 flex items-center justify-between">
        {/* 왼쪽: 로고 */}
        <div className="flex-1 flex items-center">
          <h1
            className="text-lg [@media(min-width:1025px)]:text-xl font-bold text-blue-600 cursor-pointer select-none"
            onClick={() => navigate("/dashboard")}
            style={{ cursor: 'pointer' }}
          >
            Health AI
          </h1>
        </div>
        {/* 데스크탑: 메뉴/버튼 */}
        <nav className="hidden [@media(min-width:1025px)]:flex flex-1 justify-center gap-8">
          {menus.map((menu) => (
            <button
              key={menu.name}
              className={`text-base font-bold cursor-pointer ${location.pathname === menu.path ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
              onClick={() => navigate(menu.path)}
              style={{ cursor: 'pointer' }}
            >
              {menu.name}
            </button>
          ))}
        </nav>
        <div className="hidden [@media(min-width:1025px)]:flex flex-1 justify-end items-center gap-2">
          {user ? (
            <>
              <Button
                className="bg-gray-100 text-blue-600 hover:bg-gray-200 cursor-pointer"
                onClick={() => navigate("/mypage")}
                style={{ cursor: 'pointer' }}
              >
                마이페이지
              </Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                onClick={() => {
                  clearUser();
                  navigate("/login");
                }}
                style={{ cursor: 'pointer' }}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-gray-700 cursor-pointer" onClick={() => navigate("/login")}>로그인</Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" onClick={() => navigate("/signup")}>회원가입</Button>
            </>
          )}
        </div>
        {/* 모바일: 햄버거 버튼 */}
        {mobileOpen ? null : (
          <button
            className="[@media(min-width:1025px)]:hidden flex items-center justify-center p-2 cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="메뉴 열기"
            style={{ cursor: 'pointer' }}
          >
            <HiMenu className="w-7 h-7 cursor-pointer" />
          </button>
        )}
      </div>
      {/* 모바일 메뉴 드로어 */}
      <MobileMenuModal open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <div className="flex flex-col gap-2 mt-8">
          {menus.map((menu) => (
            <button
              key={menu.name}
              className={`text-lg font-semibold text-left cursor-pointer ${location.pathname === menu.path ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
              onClick={() => handleMenuClick(menu.path)}
              style={{ cursor: 'pointer' }}
            >
              {menu.name}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-6 border-t pt-4">
          {user ? (
            <>
              <Button
                className="bg-gray-100 text-blue-600 hover:bg-gray-200 w-full cursor-pointer"
                onClick={() => handleMenuClick("/mypage")}
                style={{ cursor: 'pointer' }}
              >
                마이페이지
              </Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 w-full cursor-pointer"
                onClick={() => {
                  clearUser();
                  handleMenuClick("/login");
                }}
                style={{ cursor: 'pointer' }}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-gray-700 w-full cursor-pointer" onClick={() => handleMenuClick("/login")}>로그인</Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 w-full cursor-pointer" onClick={() => handleMenuClick("/signup")}>회원가입</Button>
            </>
          )}
        </div>
      </MobileMenuModal>
    </header>
  );
};

export default Header;
