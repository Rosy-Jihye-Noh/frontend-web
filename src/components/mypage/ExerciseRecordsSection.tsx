// src/components/mypage/ExerciseRecordsSection.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { HiTrendingUp, HiCheckCircle, HiFlag } from 'react-icons/hi';
import { ExerciseCalendar } from '@/components/log/ExerciseCalendar';
import DailyLogComponent from '@/components/log/DailyLogComponent';
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';
import type { ProfileUser, Goal } from '@/types/index'; // Goal 타입 임포트
import { Progress } from '@/components/ui/progress'; // shadcn/ui의 Progress 컴포넌트 사용

// props 인터페이스 정의
interface ExerciseRecordsSectionProps {
  userProfile: ProfileUser | null;
}

const ExerciseRecordsSection: React.FC<ExerciseRecordsSectionProps> = ({ userProfile }) => {
  const { pastLogs, fetchPastLogs } = useLogStore();
  const { user } = useUserStore();
  const userId = user?.id;

  const [isLoading, setIsLoading] = useState(false);
  
  // 주간/월간 목표 상태 관리
  const [goals, setGoals] = useState<{ weekly: Goal | null; monthly: Goal | null }>({
    weekly: null,
    monthly: null,
  });

  // userProfile에서 목표 데이터를 파싱하여 상태에 저장
  useEffect(() => {
    if (userProfile) {
      try {
        const weekly = userProfile.weeklyGoal ? JSON.parse(userProfile.weeklyGoal) : null;
        const monthly = userProfile.monthlyGoal ? JSON.parse(userProfile.monthlyGoal) : null;
        setGoals({ weekly, monthly });
      } catch (error) {
        console.error("Failed to parse goals JSON:", error);
        setGoals({ weekly: null, monthly: null });
      }
    }
  }, [userProfile]);

  // 실제 운동 기록 횟수 계산 (useMemo로 최적화)
  const exerciseCounts = useMemo(() => {
    if (!Array.isArray(pastLogs) || !userId) {
      return { weekly: 0, monthly: 0 };
    }

    const userLogs = pastLogs.filter(log => log.userId === userId);
    const uniqueLogsByDate = new Map<string, any>();
    userLogs.forEach(log => {
      uniqueLogsByDate.set(log.exerciseDate, log);
    });
    const uniqueLogs = Array.from(uniqueLogsByDate.values());

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const weeklyCount = uniqueLogs.filter(log => {
      const logDate = new Date(log.exerciseDate);
      return logDate >= startOfWeek && logDate <= endOfWeek;
    }).length;
    
    const monthlyCount = uniqueLogs.filter(log => {
      const logDate = new Date(log.exerciseDate);
      return logDate >= startOfMonth && logDate <= endOfMonth;
    }).length;

    return { weekly: weeklyCount, monthly: monthlyCount };
  }, [pastLogs, userId]);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      fetchPastLogs(userId).finally(() => setIsLoading(false));
    }
  }, [userId, fetchPastLogs]);

  // 목표 달성률 계산
  const weeklyProgress = goals.weekly ? (exerciseCounts.weekly / goals.weekly.workouts) * 100 : 0;
  const monthlyProgress = goals.monthly ? (exerciseCounts.monthly / goals.monthly.workouts) * 100 : 0;
  
if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-lg p-6">
        <div className="flex flex-col justify-center items-center min-h-[400px]">
          <div 
            className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full mb-4"
            role="status"
            aria-live="polite"
          >
            <span className="sr-only">Loading...</span>
          </div>
          <p className="text-md font-medium text-gray-500 dark:text-gray-400">
            운동 기록을 불러오는 중입니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">운동 기록 및 목표 달성률</h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 좌측: 캘린더 및 목표 달성률 */}
        <div className="space-y-6">
          <ExerciseCalendar />
          
          <div className="space-y-4">
            {/* 주간 목표 */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900 group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <HiTrendingUp className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-md text-foreground">주간 목표</h3>
                </div>
                {goals.weekly && (
                  <span
                    className="text-xs font-medium text-gray-500 group-hover:text-blue-600 group-hover:font-bold group-hover:text-sm transition-all duration-200"
                  >
                    AI 예측 달성률: {goals.weekly.completion_rate}%
                  </span>
                )}
              </div>
              {goals.weekly ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    이번 주 목표 운동 횟수는 <strong className="text-blue-600">{goals.weekly.workouts}회</strong> 입니다.
                  </p>
                  <Progress value={weeklyProgress} className="h-2.5 [&>*]:bg-blue-500" />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{Math.min(exerciseCounts.weekly, goals.weekly.workouts)} / {goals.weekly.workouts} 회 달성</span>
                    <span className="text-sm font-bold text-blue-600">{weeklyProgress.toFixed(0)}%</span>
                  </div>
                </>
              ) : (
                <p className="text-center text-sm text-gray-400 py-4">주간 목표가 설정되지 않았습니다.</p>
              )}
            </div>

            {/* 월간 목표 */}
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-100 dark:border-green-900 group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <HiFlag className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold text-md text-foreground">월간 목표</h3>
                </div>
                {goals.monthly && (
                  <span
                    className="text-xs font-medium text-gray-500 group-hover:text-green-600 group-hover:font-bold group-hover:text-sm transition-all duration-200"
                  >
                    AI 예측 달성률: {goals.monthly.completion_rate}%
                  </span>
                )}
              </div>
              {goals.monthly ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    이번 달 목표 운동 횟수는 <strong className="text-green-600">{goals.monthly.workouts}회</strong> 입니다.
                  </p>
                  <Progress value={monthlyProgress} className="h-2.5 [&>*]:bg-green-500" />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{Math.min(exerciseCounts.monthly, goals.monthly.workouts)} / {goals.monthly.workouts} 회 달성</span>
                    <span className="text-sm font-bold text-green-600">{monthlyProgress.toFixed(0)}%</span>
                  </div>
                </>
              ) : (
                <p className="text-center text-sm text-gray-400 py-4">월간 목표가 설정되지 않았습니다.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* 우측: 일일 로그 컴포넌트 */}
        <div>
          <DailyLogComponent />
        </div>
      </div>
    </div>
  );
};

export default ExerciseRecordsSection;