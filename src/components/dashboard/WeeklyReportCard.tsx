import React, { useState, useEffect } from 'react';
import { HiCalendar, HiTrendingUp, HiCheckCircle, HiFlag } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';
import axiosInstance from '@/api/axiosInstance';
import type { Goal, ProfileUser } from '@/types/index'; // Goal, ProfileUser 타입 임포트
import { Progress } from '@/components/ui/progress'; // Progress 컴포넌트 임포트

// 기존 WeeklyStats 인터페이스는 제거하거나 유지해도 괜찮습니다. 여기서는 Goal을 직접 사용합니다.
interface ReportStats {
  thisWeekCompleted: number;
  thisMonthCompleted: number;
  thisMonthTotalDays: number;
  thisMonthCompletionRate: number;
}

const WeeklyReportCard: React.FC = () => {
  const { user } = useUserStore();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [aiGoal, setAiGoal] = useState<Goal | null>(null); // AI 주간 목표 상태
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchReportData = async () => {
      try {
        setIsLoading(true);

        // 1. 사용자 프로필(AI 목표 포함)과 운동 기록을 동시에 가져오기
        const [profileResponse, logsResponse] = await Promise.all([
          axiosInstance.get<ProfileUser>(`/users/${user.id}`),
          axiosInstance.get(`/logs/user/${user.id}`)
        ]);

        // 2. AI 주간 목표 파싱 및 설정
        const userProfile = profileResponse.data;
        if (userProfile?.weeklyGoal) {
          try {
            setAiGoal(JSON.parse(userProfile.weeklyGoal));
          } catch (e) {
            console.error("AI 주간 목표 파싱 실패:", e);
            setAiGoal(null);
          }
        }

        // 3. 운동 기록 기반 통계 계산
        const allLogs = logsResponse.data || [];
        const now = new Date();

        // 이번주 데이터 필터링 (월요일 ~ 오늘)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const weekData = allLogs.filter((log: any) => new Date(log.exerciseDate) >= startOfWeek);
        
        const weekLogsByDate = weekData.reduce((acc: Record<string, any[]>, log: any) => {
          acc[log.exerciseDate] = acc[log.exerciseDate] || [];
          acc[log.exerciseDate].push(log);
          return acc;
        }, {});

        const thisWeekCompleted = (Object.values(weekLogsByDate) as any[][]).filter((logs: any[]) => 
          logs.every(log => log.completionRate === 100)
        ).length;

        // 이번달 통계 계산
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthData = allLogs.filter((log: any) => new Date(log.exerciseDate) >= startOfMonth);
        const monthLogsByDate = monthData.reduce((acc: Record<string, any[]>, log: any) => {
            acc[log.exerciseDate] = acc[log.exerciseDate] || [];
            acc[log.exerciseDate].push(log);
            return acc;
        }, {});
        const thisMonthCompleted = Object.values(monthLogsByDate).length;
        const thisMonthTotalDays = now.getDate();
        const thisMonthCompletionRate = thisMonthTotalDays > 0 ? Math.round((thisMonthCompleted / thisMonthTotalDays) * 100) : 0;

        setStats({ thisWeekCompleted, thisMonthCompleted, thisMonthTotalDays, thisMonthCompletionRate });

      } catch (error) {
        console.error('리포트 데이터 로드 실패:', error);
        setStats({ thisWeekCompleted: 0, thisMonthCompleted: 0, thisMonthTotalDays: new Date().getDate(), thisMonthCompletionRate: 0 });
        setAiGoal(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [user]);

  // 주간 목표 달성률 계산
  const weeklyProgress = aiGoal ? ( (stats?.thisWeekCompleted || 0) / aiGoal.workouts) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 shadow-lg rounded-lg bg-card min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
        <p className="text-gray-500">리포트 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 shadow-lg rounded-lg bg-card">
      <div className="flex items-center mb-4">
        <HiCalendar className="text-blue-500 w-8 h-8 mr-2" />
        <h2 className="text-xl font-bold text-foreground">운동 리포트</h2>
      </div>

      <div className="space-y-6">
        {/* 이번주 통계 (AI 목표와 통합) */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900 group">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <HiTrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-md text-foreground">주간 목표 달성 현황</h3>
            </div>
            {aiGoal && (
              <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 group-hover:font-bold group-hover:text-sm transition-all duration-200">
                AI 예측 달성률: {aiGoal.completion_rate}%
              </span>
            )}
          </div>
          {aiGoal ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                이번 주 목표 운동 횟수는 <strong className="text-blue-600">{aiGoal.workouts}회</strong> 입니다.
              </p>
              <Progress value={weeklyProgress} className="h-2.5 [&>*]:bg-blue-500" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">{stats?.thisWeekCompleted || 0} / {aiGoal.workouts} 회 달성</span>
                <span className="text-sm font-bold text-blue-600">{weeklyProgress.toFixed(0)}%</span>
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-gray-400 py-4">AI 주간 목표가 설정되지 않았습니다.</p>
          )}
        </div>

        {/* 이번달 통계 */}
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-800 dark:text-green-300 flex items-center">
              <HiFlag className="w-5 h-5 mr-2" />
              이번달 출석률
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${(stats?.thisMonthCompletionRate ?? 0) >= 80 ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'}`}>
              {(stats?.thisMonthCompletionRate ?? 0)}%
            </span>
          </div>
          <div className="text-center text-sm">
              <p>
                <span className="text-gray-600 dark:text-gray-300">총 {stats?.thisMonthTotalDays || 0}일 중 </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400 mx-1">{stats?.thisMonthCompleted || 0}</span>
                <span className="text-gray-600 dark:text-gray-300">일 운동 완료!</span>
              </p>
          </div>
        </div>

        {/* 격려 메시지 */}
        <div className="text-center p-3 bg-muted rounded-lg">
          {weeklyProgress >= 100 ? (
            <div className="flex items-center justify-center text-green-600">
              <HiCheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">주간 목표 달성! 정말 대단해요!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center text-blue-600 dark:text-blue-400">
              <HiTrendingUp className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">목표를 향해 꾸준히 나아가고 있어요!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportCard;