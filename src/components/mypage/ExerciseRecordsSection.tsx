import React, { useState, useEffect } from 'react';
import { HiTrendingUp, HiCheckCircle } from 'react-icons/hi';
import { ExerciseCalendar } from '@/components/log/ExerciseCalendar';
import DailyLogComponent from '@/components/log/DailyLogComponent';
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';

interface ExerciseRecordsSectionProps {
  // props에서 userId 제거
}

interface WeeklyMonthlyStats {
  weeklyExerciseCount: number;
  monthlyExerciseCount: number;
  weeklyCompletedRoutines: number;
  monthlyCompletedRoutines: number;
}

const ExerciseRecordsSection: React.FC<ExerciseRecordsSectionProps> = () => {
  const [stats, setStats] = useState<WeeklyMonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { pastLogs, fetchPastLogs } = useLogStore();
  const { user } = useUserStore();
  
  const userId = user?.id;

  // exercise-log-storage 데이터에서 주간/월간 완료된 루틴 개수 계산
  const calculateRoutineStats = () => {
    try {
      const logData = localStorage.getItem('exercise-log-storage');
      if (!logData) {
        return { weeklyCompletedRoutines: 0, monthlyCompletedRoutines: 0 };
      }

      const parsedData = JSON.parse(logData);
      const sessions = parsedData?.state?.sessions || {};

      // 현재 날짜 기준 계산
      const now = new Date();
      
      // 이번주 월요일부터 일요일까지 계산
      const currentDay = now.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
      const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // 일요일인 경우 6일 전이 월요일
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - daysFromMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // 일요일
      endOfWeek.setHours(23, 59, 59, 999);

      // 이번달 1일부터 마지막 날까지 계산
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      let weeklyCompletedRoutines = 0;
      let monthlyCompletedRoutines = 0;

      // 각 날짜별로 완료된 루틴 개수 카운트
      Object.keys(sessions).forEach(dateStr => {
        const sessionDate = new Date(dateStr);
        const daySessions = sessions[dateStr];

        if (!daySessions || typeof daySessions !== 'object') return;

        // 해당 날짜의 완료된 루틴들 (completionRate === 100)
        const completedRoutinesForDay = new Set<string>();
        Object.values(daySessions).forEach((session: any) => {
          if (session && session.routineName && session.completionRate === 100) {
            completedRoutinesForDay.add(session.routineName);
          }
        });

        const completedCount = completedRoutinesForDay.size;

        // 이번주에 포함되는지 확인
        if (sessionDate >= startOfWeek && sessionDate <= endOfWeek) {
          weeklyCompletedRoutines += completedCount;
        }

        // 이번달에 포함되는지 확인
        if (sessionDate >= startOfMonth && sessionDate <= endOfMonth) {
          monthlyCompletedRoutines += completedCount;
        }
      });

      return { weeklyCompletedRoutines, monthlyCompletedRoutines };
    } catch (error) {
      console.error('루틴 통계 계산 중 오류:', error);
      return { weeklyCompletedRoutines: 0, monthlyCompletedRoutines: 0 };
    }
  };

  // 기존 로그 기반 통계 계산 (운동 기록 횟수)
  const calculateLogStats = (logs: any[]) => {
    if (!Array.isArray(logs) || logs.length === 0) {
      return { weeklyExerciseCount: 0, monthlyExerciseCount: 0 };
    }

    // 사용자의 로그만 필터링
    const userLogs = logs.filter(log => log.userId === userId);
    
    // 날짜별 중복 제거 (ExerciseCalendar와 동일한 로직)
    const uniqueLogsByDate = new Map<string, any>();
    userLogs.forEach(log => {
      const existingLog = uniqueLogsByDate.get(log.exerciseDate);
      if (!existingLog || new Date(log.createdAt || log.exerciseDate) > new Date(existingLog.createdAt || existingLog.exerciseDate)) {
        uniqueLogsByDate.set(log.exerciseDate, log);
      }
    });
    
    const uniqueLogs = Array.from(uniqueLogsByDate.values());
    
    const now = new Date();
    
    // 이번주 월요일부터 일요일까지
    const currentDay = now.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // 이번달 1일부터 마지막 날까지
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const weeklyCount = uniqueLogs.filter(log => {
      const logDate = new Date(log.exerciseDate);
      return logDate >= startOfWeek && logDate <= endOfWeek;
    }).length;
    
    const monthlyCount = uniqueLogs.filter(log => {
      const logDate = new Date(log.exerciseDate);
      return logDate >= startOfMonth && logDate <= endOfMonth;
    }).length;
    
    return {
      weeklyExerciseCount: weeklyCount,
      monthlyExerciseCount: monthlyCount
    };
  };

  // 통계 계산 및 업데이트 함수
  const updateAllStats = React.useCallback(() => {
    if (!userId) {
      setStats(null);
      return;
    }

    const logStats = calculateLogStats(pastLogs);
    const routineStats = calculateRoutineStats();
    
    setStats({
      ...logStats,
      ...routineStats
    });
  }, [userId, pastLogs]);

  // 컴포넌트 마운트 시 즉시 통계 초기화
  useEffect(() => {
    if (userId) {
      // 로컬 스토리지에서 즉시 루틴 통계 로드
      const routineStats = calculateRoutineStats();
      setStats({
        weeklyExerciseCount: 0,
        monthlyExerciseCount: 0,
        ...routineStats
      });
    }
  }, [userId]);

  // 사용자 변경 시 즉시 데이터 로드
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      fetchPastLogs(userId).then(() => {
        setIsLoading(false);
      });
    } else {
      setStats(null);
      setIsLoading(false);
    }
  }, [userId, fetchPastLogs]);

  // pastLogs 또는 userId 변경 시 통계 업데이트
  useEffect(() => {
    updateAllStats();
  }, [updateAllStats]);

  // 실시간으로 exercise-log-storage 상태 업데이트 및 통계 갱신
  useEffect(() => {
    if (!userId) return;

    // 초기 로드
    updateAllStats();
    
    // storage 이벤트 리스너 추가 (다른 탭에서의 변경사항 감지)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'exercise-log-storage') {
        updateAllStats();
      }
    };
    
    // 페이지 focus 이벤트 리스너 추가
    const handleFocus = () => {
      updateAllStats();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    // 5초마다 업데이트 (실시간 반영)
    const interval = setInterval(updateAllStats, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [userId, updateAllStats]);

  // 사용자 정보가 없는 경우 처리 (user 상태가 undefined가 아니라 null일 때만)
  if (user === null) {
    return (
      <div className="bg-card rounded-xl shadow-lg p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center text-gray-500">
            <p>로그인이 필요합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  // 사용자 정보 로딩 중
  if (user === undefined || !userId) {
    return (
      <div className="bg-card rounded-xl shadow-lg p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2"></div>
            <p>사용자 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-lg p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2"></div>
            <p>운동 기록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">운동 기록</h2>

      {/* 운동 기록 메인 컨텐츠 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="xl:sticky xl:top-4 xl:h-fit">
          <ExerciseCalendar />

                    {/* 격려/칭찬 메시지 */}
          {stats && (
            <div className="mt-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 border border-purple-100 dark:border-border">
                <div className="flex items-center space-x-3">
                  {stats.weeklyCompletedRoutines > stats.weeklyExerciseCount ? (
                    <>
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">🎉</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-1">정말 대단해요!</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          하루에 여러 개의 루틴을 수행하며 정말 열심히 운동하고 계시네요! 
                          이런 노력이 건강한 습관을 만들어갑니다. 💪
                        </p>
                      </div>
                    </>
                  ) : stats.weeklyCompletedRoutines < stats.weeklyExerciseCount ? (
                    <>
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">💪</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">조금 더 화이팅!</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          운동은 잘 하고 계시는데, 루틴 완성도를 높여보는 건 어떨까요? 
                          체계적인 루틴으로 더 효과적인 운동을 경험해보세요! 🔥
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">✨</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">완벽한 밸런스!</p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          운동 기록과 루틴 완료가 균형 잡혀 있어요! 
                          꾸준한 페이스로 건강한 운동 습관을 유지하고 계시네요. 👍
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 통계 요약 */}
          <div className="mt-6">
            {stats ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">이번 주 (월~일)</p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{stats.weeklyExerciseCount}회</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">운동 기록</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{stats.weeklyCompletedRoutines}개</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">완료된 루틴</p>
                        </div>
                      </div>
                    </div>
                    <HiTrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">이번 달 (1일~말일)</p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{stats.monthlyExerciseCount}회</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">운동 기록</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{stats.monthlyCompletedRoutines}개</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">완료된 루틴</p>
                        </div>
                      </div>
                    </div>
                    <HiCheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">이번 주</p>
                      <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">데이터 없음</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">운동 기록을 시작해보세요</p>
                    </div>
                    <HiTrendingUp className="w-8 h-8 text-gray-300" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">이번 달</p>
                      <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">데이터 없음</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">운동 기록을 시작해보세요</p>
                    </div>
                    <HiCheckCircle className="w-8 h-8 text-gray-300" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div data-component="daily-log">
            <DailyLogComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseRecordsSection;
