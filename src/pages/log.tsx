// src/pages/log.tsx

import React from 'react';
import { ExerciseCalendar } from '@/components/log/ExerciseCalendar';
import DailyLogComponent from '@/components/log/DailyLogComponent';
import { useUserStore } from '@/store/userStore';
import Header from '@/components/common/Header';
import { Card } from '@/components/ui/card';

const LogPage: React.FC = () => {
  const { user } = useUserStore();

  // 로그인하지 않은 사용자를 위한 UI
  if (!user) {
    return (
      <>
        <Header />
        <main className="container mx-auto p-4 text-center">
          <Card className="p-8 mt-8">
            <h2 className="text-lg font-semibold">로그인이 필요합니다.</h2>
            <p className="text-muted-foreground mt-2">운동 기록을 확인하고 관리하려면 로그인해주세요.</p>
          </Card>
        </main>
      </>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8"
      style={{ paddingTop: 'var(--header-height, 90px)' }}>
        <h1 className="text-3xl font-bold mb-6 text-foreground">운동 기록</h1>

        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
          <div className="xl:col-span-5 xl:sticky xl:top-24 xl:h-fit">
            <ExerciseCalendar />
          </div>
          
          <div className="xl:col-span-5">
            <DailyLogComponent />
          </div>
        </div>
      </main>
    </div>
  );
};

// ▼▼▼ 이 부분이 가장 중요합니다! ▼▼▼
// LogPage 컴포넌트를 이 파일의 기본 내보내기로 지정합니다.
export default LogPage;