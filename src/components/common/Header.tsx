import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserStore } from '@/store/userStore';
import { HiMenu, HiSun, HiMoon } from "react-icons/hi";
import MobileMenuModal from './MobileMenuModal';

/**
 * SynergyM 메인 헤더 컴포넌트
 * - 반응형 네비게이션(데스크탑/모바일)
 * - 다크모드 토글, 로그인/회원가입/마이페이지/관리자 메뉴 지원
 * - 메뉴 클릭 시 페이지 이동만 담당(인증 체크는 각 페이지에서)
 */

const menus = [
  { name: "홈", path: "/dashboard" },
  { name: "커뮤니티", path: "/community" },
  { name: "운동 목록", path: "/exercises" },
  { name: "자세 분석", path: "/photoupload" },
];

const Header: React.FC = () => {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  // 다크모드 상태 동기화
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 메뉴 클릭 시 닫기 및 이동
  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  // 메뉴 클릭 시 페이지 이동만 담당(인증 체크 없음)
  const handleAuthenticatedMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };
  
  // 다크모드 토글
  const handleDarkModeToggle = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-border">
      <div className="container mx-auto px-4 py-2 [@media(min-width:1025px)]:py-3 flex items-center justify-between">
        {/* 왼쪽: 로고 */}
        <div className="flex-1 flex items-center">
          <h1
            className="text-lg [@media(min-width:1025px)]:text-xl font-bold text-blue-600 cursor-pointer select-none"
            onClick={() => navigate("/dashboard")}
            style={{ cursor: 'pointer' }}
          >
            Synergym AI
          </h1>
        </div>
        {/* 데스크탑: 메뉴/버튼 */}
        <nav className="hidden [@media(min-width:1025px)]:flex flex-1 justify-center gap-8">
          {menus.map((menu) => (
            <button
              key={menu.name}
              className={`text-base font-bold cursor-pointer ${location.pathname === menu.path ? "text-blue-600" : "text-foreground hover:text-blue-600"}`}
              onClick={() => handleAuthenticatedMenuClick(menu.path)}
              style={{ cursor: 'pointer' }}
            >
              {menu.name}
            </button>
          ))}
        </nav>
        <div className="hidden [@media(min-width:1025px)]:flex flex-1 justify-end items-center gap-2">
          {/* 다크모드 토글 버튼 */}
          <button
            onClick={handleDarkModeToggle}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="다크모드 토글"
            style={{ marginRight: 8 }}
          >
            {darkMode ? <HiSun className="w-6 h-6 text-yellow-400" /> : <HiMoon className="w-6 h-6 text-gray-700" />}
          </button>
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Button
                  className="bg-gray-100 text-black hover:bg-gray-200 cursor-pointer"
                  onClick={() => navigate('/admin')}
                  style={{ cursor: 'pointer' }}
                >
                  관리자 페이지
                </Button>
              )}
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
              <Button variant="ghost" className="text-foreground cursor-pointer" onClick={() => navigate("/login")}>로그인</Button>
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
          {/* 다크모드 토글 버튼 */}
          <button
            onClick={handleDarkModeToggle}
            className="self-end p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-2"
            aria-label="다크모드 토글"
          >
            {darkMode ? <HiSun className="w-6 h-6 text-yellow-400" /> : <HiMoon className="w-6 h-6 text-gray-700" />}
          </button>
          {menus.map((menu) => (
            <button
              key={menu.name}
              className={`text-lg font-semibold text-left cursor-pointer ${location.pathname === menu.path ? "text-blue-600" : "text-foreground hover:text-blue-600"}`}
              onClick={() => handleAuthenticatedMenuClick(menu.path)}
              style={{ cursor: 'pointer' }}
            >
              {menu.name}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-6 border-t pt-4">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Button
                  className="bg-yellow-500 text-white hover:bg-yellow-600 w-full cursor-pointer mb-2"
                  onClick={() => handleMenuClick('/admin')}
                  style={{ cursor: 'pointer' }}
                >
                  관리자 페이지
                </Button>
              )}
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
              <Button variant="ghost" className="text-foreground w-full cursor-pointer" onClick={() => handleMenuClick("/login")}>로그인</Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 w-full cursor-pointer" onClick={() => handleMenuClick("/signup")}>회원가입</Button>
            </>
          )}
        </div>
      </MobileMenuModal>
    </header>
  );
};

export default Header;
