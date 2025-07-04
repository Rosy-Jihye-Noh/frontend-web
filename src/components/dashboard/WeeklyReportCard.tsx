import React, { useState, useEffect } from 'react';
import { HiCalendar, HiTrendingUp, HiCheckCircle } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';
import axiosInstance from '@/api/axiosInstance';

interface WeeklyStats {
  thisWeek: {
    totalWorkouts: number;
    completedWorkouts: number;
    completionRate: number;
  };
  thisMonth: {
    totalWorkouts: number;
    completedWorkouts: number;
    completionRate: number;
  };
}

const WeeklyReportCard: React.FC = () => {
  const { user } = useUserStore();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchWeeklyStats = async () => {
      try {
        setIsLoading(true);
        
        let weekData: any[] = [];
        let monthData: any[] = [];
        
        // API 호출 - 실제 백엔드 엔드포인트에 맞춰 수정
        try {
          // 사용자의 모든 로그를 가져와서 클라이언트에서 필터링
          const allLogsResponse = await axiosInstance.get(`/logs/user/${user.id}`);
          const allLogs = allLogsResponse.data || [];
          
          // 현재 날짜 기준으로 이번주와 이번달 계산
          const now = new Date();
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          
          // 이번주 데이터 필터링
          weekData = allLogs.filter((log: any) => {
            const logDate = new Date(log.exerciseDate);
            return logDate >= startOfWeek && logDate <= endOfWeek;
          });
          
          // 이번달 데이터 필터링
          monthData = allLogs.filter((log: any) => {
            const logDate = new Date(log.exerciseDate);
            return logDate >= startOfMonth && logDate <= endOfMonth;
          });

          console.log('주간 리포트 데이터:', { weekData: weekData.length, monthData: monthData.length });
        } catch (apiError) {
          console.warn('API 호출 실패, 빈 데이터로 설정:', apiError);
          weekData = [];
          monthData = [];
        }

        // 이번주 통계 계산
        const thisWeekTotal = weekData.length;
        const thisWeekCompleted = weekData.filter((log: any) => log.completionRate >= 100).length;
        const thisWeekCompletionRate = thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0;

        // 이번달 통계 계산
        const thisMonthTotal = monthData.length;
        const thisMonthCompleted = monthData.filter((log: any) => log.completionRate >= 100).length;
        const thisMonthCompletionRate = thisMonthTotal > 0 ? Math.round((thisMonthCompleted / thisMonthTotal) * 100) : 0;

        setStats({
          thisWeek: {
            totalWorkouts: thisWeekTotal,
            completedWorkouts: thisWeekCompleted,
            completionRate: thisWeekCompletionRate
          },
          thisMonth: {
            totalWorkouts: thisMonthTotal,
            completedWorkouts: thisMonthCompleted,
            completionRate: thisMonthCompletionRate
          }
        });
      } catch (error) {
        console.error('주간 통계 로드 실패:', error);
        // 에러 시 기본값 설정
        setStats({
          thisWeek: { totalWorkouts: 0, completedWorkouts: 0, completionRate: 0 },
          thisMonth: { totalWorkouts: 0, completedWorkouts: 0, completionRate: 0 }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyStats();
  }, [user]);

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    if (rate >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center p-6 shadow-lg rounded-lg">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
        <p className="text-gray-500">통계를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 shadow-lg rounded-lg bg-white">
      <div className="flex items-center mb-4">
        <HiCalendar className="text-blue-500 w-8 h-8 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">운동 리포트</h2>
      </div>

      <div className="space-y-6">
        {/* 이번주 통계 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-800 flex items-center">
              <HiCalendar className="w-5 h-5 mr-2" />
              이번주
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCompletionColor(stats?.thisWeek.completionRate || 0)}`}>
              {stats?.thisWeek.completionRate || 0}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.thisWeek.totalWorkouts || 0}</div>
              <div className="text-gray-600">총 운동</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.thisWeek.completedWorkouts || 0}</div>
              <div className="text-gray-600">완료한 운동</div>
            </div>
          </div>
        </div>

        {/* 이번달 통계 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-800 flex items-center">
              <HiTrendingUp className="w-5 h-5 mr-2" />
              이번달
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCompletionColor(stats?.thisMonth.completionRate || 0)}`}>
              {stats?.thisMonth.completionRate || 0}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.thisMonth.totalWorkouts || 0}</div>
              <div className="text-gray-600">총 운동</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.thisMonth.completedWorkouts || 0}</div>
              <div className="text-gray-600">완료한 운동</div>
            </div>
          </div>
        </div>

        {/* 격려 메시지 */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          {(stats?.thisWeek.completionRate || 0) >= 80 ? (
            <div className="flex items-center justify-center text-green-600">
              <HiCheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">훌륭해요! 계속 이어가세요!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center text-blue-600">
              <HiTrendingUp className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">조금만 더 노력하면 목표 달성!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportCard; 