import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType; // 아이콘은 컴포넌트이므로 ElementType으로 지정
  details?: string; // optional prop
}

export function StatCard({ title, value, icon: Icon, details }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className="h-5 w-5 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {details && <p className="text-xs text-green-500">{details}</p>}
      </CardContent>
    </Card>
  );
}