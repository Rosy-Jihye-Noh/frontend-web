import React from 'react';
import { ExerciseCalendar } from '@/components/log/ExerciseCalendar'; // 운동 기록 달력 컴포넌트 임포트
import DailyLogComponent from '@/components/log/DailyLogComponent'; // 일별 운동 기록 컴포넌트 임포트
import { useUserStore } from '@/store/userStore';
import Header from '@/components/common/Header'; // 공통 헤더 컴포넌트 임포트
import { Card } from '@/components/ui/card';

// LogPage 함수형 컴포넌트
const LogPage: React.FC = () => {
  const { user } = useUserStore();

  // 사용자가 로그인하지 않은 경우
  if (!user) {
    return (
      <>
        <Header /> {/* 헤더 표시 */}
        <main className="container mx-auto p-4 text-center"> {/* 메인 콘텐츠 영역 */}
          <Card className="p-8 mt-8">
            <h2 className="text-lg font-semibold">로그인이 필요합니다. 🔑</h2> 
            <p className="text-muted-foreground mt-2">운동 기록을 확인하고 관리하려면 로그인해주세요.</p>
          </Card>
        </main>
      </>
    );
  }

  // 사용자가 로그인한 경우
  return (
    <div className="bg-background min-h-screen"> {/* 전체 배경색 및 최소 화면 높이 설정 */}
      <Header /> {/* 상단 헤더 컴포넌트 */}
      <main 
        className="container mx-auto p-4 md:p-8" // 메인 콘텐츠 영역
        style={{ paddingTop: 'var(--header-height, 90px)' }}
      >
        <h1 className="text-3xl font-bold mb-6 text-foreground">운동 기록 📝</h1> {/* 페이지 제목 */}

        {/* 운동 달력과 일별 운동 기록 컴포넌트를 위한 그리드 레이아웃 */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
          {/* 운동 달력 섹션 */}
          <div className="xl:col-span-5 xl:sticky xl:top-24 xl:h-fit"> 
            <ExerciseCalendar />
          </div>
          
          {/* 일별 운동 기록 컴포넌트 섹션 */}
          <div className="xl:col-span-5">
            <DailyLogComponent />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LogPage;