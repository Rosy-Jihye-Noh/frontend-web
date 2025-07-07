import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BarChart, Users, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  { href: "/admin/post", label: "콘텐츠 관리", icon: FileText },
];

// 사이드바 컴포넌트
const SidebarNav: React.FC = () => (
  <nav className="flex flex-col gap-2 p-4">
    <h1 className="text-2xl font-bold p-2 mb-4">Health AI Admin</h1>
    {navLinks.map((link) => (
      <NavLink
        key={link.href}
        to={link.href}
        end={link.href === "/admin"}
        className={({ isActive }: { isActive: boolean }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700 ${
            isActive ? "bg-blue-500 text-white" : ""
          }`
        }
      >
        <link.icon className="h-4 w-4" />
        {link.label}
      </NavLink>
    ))}
  </nav>
);

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
      {/* 데스크탑 사이드바 */}
      <aside className="hidden border-r bg-gray-800 text-white md:block">
        <SidebarNav />
      </aside>

      <div className="flex flex-col">
        {/* 모바일 헤더 */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-800 text-white p-0">
              <SidebarNav />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">Health AI Admin</h1>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}