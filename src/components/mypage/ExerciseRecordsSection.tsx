import React, { useState, useEffect } from 'react';
import { HiTrendingUp, HiCheckCircle } from 'react-icons/hi';
import { ExerciseCalendar } from '@/components/log/ExerciseCalendar';
import DailyLogComponent from '@/components/log/DailyLogComponent';

interface ExerciseRecordsSectionProps {
  userId: number;
}

interface WeeklyMonthlyStats {
  weeklyExerciseCount: number;
  monthlyExerciseCount: number;
}

const ExerciseRecordsSection: React.FC<ExerciseRecordsSectionProps> = ({ userId }) => {
  const [stats, setStats] = useState<WeeklyMonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    if (!userId) {
      console.warn('사용자 ID가 없습니다.');
      setStats(null);
      return;
    }

    setIsLoading(true);
    try {
      console.log('사용자', userId, '의 운동 통계를 가져오는 중...');
      const response = await fetch(`http://localhost:8081/api/users/${userId}/exercise-stats`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('운동 통계 로드 성공:', data);
        setStats(data);
      } else if (response.status === 404) {
        console.log('운동 통계 API 엔드포인트를 찾을 수 없음 (404)');
        setStats({ weeklyExerciseCount: 0, monthlyExerciseCount: 0 });
      } else if (response.status === 500) {
        console.error('서버 내부 오류 (500) - 백엔드 API 구현 확인 필요');
        setStats({ weeklyExerciseCount: 0, monthlyExerciseCount: 0 });
      } else {
        console.error('운동 통계 로드 실패:', response.status, response.statusText);
        setStats({ weeklyExerciseCount: 0, monthlyExerciseCount: 0 });
      }
    } catch (error) {
      console.error('운동 통계 API 호출 실패:', error);
      // 네트워크 오류나 API가 구현되지 않은 경우
      if ((error as any)?.message?.includes('fetch')) {
        console.log('운동 통계 API 엔드포인트가 구현되지 않았을 가능성이 높습니다.');
      }
      setStats({ weeklyExerciseCount: 0, monthlyExerciseCount: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">운동 기록</h2>

      {/* 운동 기록 메인 컨텐츠 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="xl:sticky xl:top-4 xl:h-fit">
          <ExerciseCalendar userId={userId} />
          
          {/* 통계 요약 */}
          <div className="mt-6">
            {stats ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">이번 주</p>
                      <p className="text-2xl font-bold text-blue-700">{stats.weeklyExerciseCount}회</p>
                      <p className="text-xs text-blue-500">운동 실행 횟수</p>
                    </div>
                    <HiTrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">이번 달</p>
                      <p className="text-2xl font-bold text-green-700">{stats.monthlyExerciseCount}회</p>
                      <p className="text-xs text-green-500">운동 실행 횟수</p>
                    </div>
                    <HiCheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">이번 주</p>
                      <p className="text-2xl font-bold text-gray-400">데이터 없음</p>
                      <p className="text-xs text-gray-400">운동 기록을 시작해보세요</p>
                    </div>
                    <HiTrendingUp className="w-8 h-8 text-gray-300" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">이번 달</p>
                      <p className="text-2xl font-bold text-gray-400">데이터 없음</p>
                      <p className="text-xs text-gray-400">운동 기록을 시작해보세요</p>
                    </div>
                    <HiCheckCircle className="w-8 h-8 text-gray-300" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <DailyLogComponent />
        </div>
      </div>
    </div>
  );
};

export default ExerciseRecordsSection;
