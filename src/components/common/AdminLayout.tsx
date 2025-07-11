import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BarChart, Users, FileText, Home } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { HiSun, HiMoon } from 'react-icons/hi';

/**
 * SynergyM 관리자 페이지 레이아웃 컴포넌트
 * - 사이드바/모바일 네비게이션, 다크모드 토글, 메인 콘텐츠 영역 제공
 * - 관리자 메뉴(대시보드, 회원 관리, 콘텐츠 관리 등)와 사용자 화면 이동 지원
 */

// Props 타입 정의
interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavLinkInfo {
  href: string;
  label: string;
  icon: LucideIcon; // lucide-react 아이콘 타입 사용
}

// 네비게이션 링크 데이터
const navLinks: NavLinkInfo[] = [
  { href: "/admin", label: "대시보드", icon: BarChart },
  { href: "/admin/members", label: "회원 관리", icon: Users },
  { href: "/admin/member-stats", label: "회원 통계", icon: Users },
  { href: "/admin/post", label: "콘텐츠 관리", icon: FileText },
  { href: "/admin/popular", label: "인기 콘텐츠", icon: FileText },
  { href: "/", label: "사용자 화면", icon: Home }, // 사용자 화면 이동 메뉴 추가
];

// 다크모드 토글 아이콘 컴포넌트
const DarkModeToggle: React.FC = () => {
  const [dark, setDark] = React.useState(() =>
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);
  return (
    <button
      onClick={() => setDark((v) => !v)}
      className="mt-8 flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors w-full justify-center"
      aria-label="다크모드 토글"
    >
      {dark ? <HiSun className="w-6 h-6 text-yellow-400" /> : <HiMoon className="w-6 h-6 text-gray-300" />}
      <span className="text-xs text-gray-300 dark:text-gray-200">다크모드</span>
    </button>
  );
};

// 사이드바 컴포넌트: 관리자 메뉴 및 다크모드 토글
const SidebarNav: React.FC = () => (
  <nav className="flex flex-col gap-2 p-4 h-full">
    <h1 className="text-xl sm:text-2xl font-bold p-2 mb-4 text-gray-100 dark:text-gray-100">Synergym AI Admin</h1>
    {navLinks.map((link) => (
      <NavLink
        key={link.href}
        to={link.href}
        end={link.href === "/admin"}
        className={({ isActive }: { isActive: boolean }) =>
          `flex items-center gap-3 rounded-lg px-3 py-3 text-sm sm:text-base text-gray-300 dark:text-gray-300 transition-all hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600 ${
            isActive ? "bg-blue-500 text-white" : ""
          }`
        }
      >
        <link.icon className="h-4 w-4 sm:h-5 sm:w-5" />
        {link.label}
      </NavLink>
    ))}
    <div className="flex-1" />
    <DarkModeToggle />
  </nav>
);

/**
 * 관리자 메인 레이아웃 컴포넌트
 * - 데스크탑: 사이드바 + 메인
 * - 모바일: 상단 메뉴 + 슬라이드 네비게이션
 * - children: 각 관리자 페이지의 실제 콘텐츠
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] bg-gray-50 dark:bg-gray-900">
      {/* 데스크탑 사이드바 */}
      <aside className="hidden border-r bg-gray-800 dark:bg-gray-900 text-white md:block">
        <SidebarNav />
      </aside>

      <div className="flex flex-col">
        {/* 모바일 헤더 */}
        <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-900 px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-800 dark:bg-gray-900 text-white p-0 w-[280px] sm:w-[320px] flex flex-col h-full">
              <SidebarNav />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Synergym AI Admin</h1>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}