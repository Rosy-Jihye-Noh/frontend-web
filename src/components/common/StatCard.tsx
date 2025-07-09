import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;      // 카드 제목
  value: string;      // 주요 수치
  icon: React.ElementType; // 아이콘 컴포넌트
  details?: string;   // 부가 설명(선택)
  className?: string; // 커스텀 클래스(선택)
}

// StatCard: 대시보드 등에서 통계 수치와 아이콘을 한눈에 보여주는 카드 컴포넌트
// - title: 항목명
// - value: 주요 수치(문자열)
// - icon: React 아이콘 컴포넌트
// - details: 부가 설명(선택)
// - className: 스타일 커스텀(선택)
export function StatCard({ title, value, icon: Icon, details, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-300">{title}</CardTitle>
        <Icon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
        {details && <p className="text-xs text-green-500 dark:text-green-400">{details}</p>}
      </CardContent>
    </Card>
  );
}