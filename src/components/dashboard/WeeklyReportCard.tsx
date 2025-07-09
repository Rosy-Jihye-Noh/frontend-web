import React, { useState, useEffect } from 'react';
import { HiCalendar, HiTrendingUp, HiCheckCircle } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';
import axiosInstance from '@/api/axiosInstance';

// 주간 통계 데이터 구조를 정의하는 인터페이스
interface WeeklyStats {
  thisWeek: { // 이번 주 통계
    totalWorkouts: number; // 총 운동 일수 (월요일부터 오늘까지의 요일 수)
    completedWorkouts: number; // 완료된 운동 일수 (해당 날짜의 모든 루틴이 100% 완료된 날)
    completionRate: number; // 완료율
  };
  thisMonth: { // 이번 달 통계
    totalWorkouts: number; // 총 운동 일수 (1일부터 오늘까지의 날짜 수)
    completedWorkouts: number; // 완료된 운동 일수
    completionRate: number; // 완료율
  };
}

// WeeklyReportCard 함수형 컴포넌트 정의
const WeeklyReportCard: React.FC = () => {
  const { user } = useUserStore();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 또는 사용자 ID가 변경될 때 통계를 불러오는 useEffect 훅
  useEffect(() => {
    if (!user?.id) return; // 사용자 ID가 없으면 함수 실행 중단

    // 주간 통계를 비동기적으로 불러오는 함수
    const fetchWeeklyStats = async () => {
      try {
        setIsLoading(true);
        
        let weekData: any[] = []; // 이번 주 운동 로그 데이터
        let monthData: any[] = []; // 이번 달 운동 로그 데이터
        
        // API 호출을 통해 운동 로그 데이터를 가져옴
        try {
          const allLogsResponse = await axiosInstance.get(`/logs/user/${user.id}`);
          const allLogs = allLogsResponse.data || []; // 데이터가 없으면 빈 배열로 초기화
          
          // 현재 날짜 기준으로 이번 주와 이번 달의 시작/끝 날짜 계산
          const now = new Date();
          const today = new Date(now);
          
          const dayOfWeek = now.getDay();
          const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - daysFromMonday);
          startOfWeek.setHours(0, 0, 0, 0); // 시간을 00:00:00.000으로 설정하여 월요일 자정부터 시작

          // 이번 주의 끝: 현재 날짜까지 (오늘 포함)
          const endOfWeek = new Date(today);
          endOfWeek.setHours(23, 59, 59, 999); // 시간을 23:59:59.999로 설정하여 오늘 자정까지 포함

          // 이번 달의 시작: 현재 연도, 현재 달의 1일
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          // 이번 달의 끝: 현재 연도, 다음 달의 0일 (즉, 이번 달의 마지막 날)
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
          
          // 가져온 모든 로그 중에서 이번 주에 해당하는 데이터만 필터링
          weekData = allLogs.filter((log: any) => {
            const logDate = new Date(log.exerciseDate); // 로그의 운동 날짜
            return logDate >= startOfWeek && logDate <= endOfWeek; // 이번 주 범위 내에 있는지 확인
          });
          
          // 가져온 모든 로그 중에서 이번 달에 해당하는 데이터만 필터링
          monthData = allLogs.filter((log: any) => {
            const logDate = new Date(log.exerciseDate); // 로그의 운동 날짜
            return logDate >= startOfMonth && logDate <= endOfMonth; // 이번 달 범위 내에 있는지 확인
          });

          console.log('주간 리포트 데이터:', { weekData: weekData.length, monthData: monthData.length });
        } catch (apiError) {
          // API 호출 실패 시 경고 메시지 출력 및 데이터를 빈 배열로 설정하여 오류 처리
          console.warn('API 호출 실패, 빈 데이터로 설정:', apiError);
          weekData = [];
          monthData = [];
        }

        // --- 이번 주 통계 계산 ---
        // 월요일부터 현재 요일까지의 총 날짜 수 계산 (이번 주에 포함되는 날짜의 기준)
        const currentDayOfWeek = new Date().getDay();
        const thisWeekTotal = currentDayOfWeek === 0 ? 7 : currentDayOfWeek; 
        
        // 날짜별로 로그를 그룹화하여, 해당 날짜의 모든 루틴이 100% 완료되었는지 확인
        const weekLogsByDate = weekData.reduce((acc: Record<string, any[]>, log: any) => {
          if (!acc[log.exerciseDate]) {
            acc[log.exerciseDate] = [];
          }
          acc[log.exerciseDate].push(log);
          return acc;
        }, {});
        
        // 이번 주에 모든 루틴이 100% 완료된 날짜의 수 카운트
        const thisWeekCompleted = Object.values(weekLogsByDate).filter((logsForDate: any[]) => 
          logsForDate.every(log => log.completionRate === 100)
        ).length;
        
        // 이번 주 완료율 계산 (총 요일 수 대비 완료된 날짜 수)
        const thisWeekCompletionRate = thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0;

        // --- 이번 달 통계 계산 ---
        // 이번 달 1일부터 오늘까지의 총 날짜 수
        const todayOfMonth = new Date();
        const thisMonthTotalDays = todayOfMonth.getDate();
        
        // 날짜별로 로그를 그룹화하여, 해당 날짜의 모든 루틴이 100% 완료되었는지 확인
        const monthLogsByDate = monthData.reduce((acc: Record<string, any[]>, log: any) => {
          if (!acc[log.exerciseDate]) {
            acc[log.exerciseDate] = [];
          }
          acc[log.exerciseDate].push(log);
          return acc;
        }, {});
        
        // 이번 달에 모든 루틴이 100% 완료된 날짜의 수 카운트
        const thisMonthCompleted = Object.values(monthLogsByDate).filter((logsForDate: any[]) => 
          logsForDate.every(log => log.completionRate === 100)
        ).length;
        
        // 이번 달 완료율 계산 (총 날짜 수 대비 완료된 날짜 수)
        const thisMonthCompletionRate = thisMonthTotalDays > 0 ? Math.round((thisMonthCompleted / thisMonthTotalDays) * 100) : 0;

        // 계산된 통계 데이터를 상태에 설정
        setStats({
          thisWeek: {
            totalWorkouts: thisWeekTotal,
            completedWorkouts: thisWeekCompleted,
            completionRate: thisWeekCompletionRate
          },
          thisMonth: {
            totalWorkouts: thisMonthTotalDays,
            completedWorkouts: thisMonthCompleted,
            completionRate: thisMonthCompletionRate
          }
        });
      } catch (error) {
        console.error('주간 통계 로드 실패:', error);
        // 에러 발생 시 통계 데이터를 기본값(0)으로 설정
        setStats({
          thisWeek: { totalWorkouts: 0, completedWorkouts: 0, completionRate: 0 },
          thisMonth: { totalWorkouts: 0, completedWorkouts: 0, completionRate: 0 }
        });
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    fetchWeeklyStats(); // 통계 불러오기 함수 호출
  }, [user]); // user 객체가 변경될 때마다 이펙트 재실행

  /**
   * 완료율에 따라 다른 Tailwind CSS 클래스 이름을 반환하여 색상을 동적으로 적용합니다.
   * @param {number} rate - 완료율 (0-100)
   * @returns {string} Tailwind CSS 클래스 문자열
   */
  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100'; // 80% 이상: 초록색
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100'; // 60% 이상: 노란색
    if (rate >= 40) return 'text-orange-600 bg-orange-100'; // 40% 이상: 주황색
    return 'text-red-600 bg-red-100'; // 40% 미만: 빨간색
  };

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return (
      <div className="flex flex-col items-center p-6 shadow-lg rounded-lg">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
        <p className="text-gray-500">통계를 불러오는 중...</p>
      </div>
    );
  }

  // 로딩이 완료되면 실제 통계 리포트 카드 UI 렌더링
  return (
    <div className="flex flex-col p-6 shadow-lg rounded-lg bg-card"> {/* 카드 전체 컨테이너 */}
      <div className="flex items-center mb-4">
        <HiCalendar className="text-blue-500 w-8 h-8 mr-2" /> {/* 달력 아이콘 */}
        <h2 className="text-xl font-bold text-foreground">운동 리포트</h2> {/* 카드 제목 */}
      </div>

      <div className="space-y-6">
        {/* 이번 주 통계 섹션 */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center">
              <HiCalendar className="w-5 h-5 mr-2" /> {/* 이번 주 아이콘 */}
              이번주
            </h3>
            {/* 이번 주 완료율 표시 (색상 동적 적용) */}
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCompletionColor(stats?.thisWeek.completionRate || 0)}`}>
              {stats?.thisWeek.completionRate || 0}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{stats?.thisWeek.totalWorkouts || 0}</div>
              <div className="text-gray-600 dark:text-gray-300">이번주 총 일수</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">(월~오늘)</div> {/* 기준 설명 */}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.thisWeek.completedWorkouts || 0}</div>
              <div className="text-blue-600 dark:text-blue-400">완료한 날짜</div>
            </div>
          </div>
        </div>

        {/* 이번 달 통계 섹션 */}
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-800 dark:text-green-300 flex items-center">
              <HiTrendingUp className="w-5 h-5 mr-2" /> {/* 이번 달 아이콘 */}
              이번달
            </h3>
            {/* 이번 달 완료율 표시 (색상 동적 적용) */}
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCompletionColor(stats?.thisMonth.completionRate || 0)}`}>
              {stats?.thisMonth.completionRate || 0}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{stats?.thisMonth.totalWorkouts || 0}</div>
              <div className="text-gray-600 dark:text-gray-300">이번달 총 일수</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">(1일~오늘)</div> {/* 기준 설명 */}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.thisMonth.completedWorkouts || 0}</div>
              <div className="text-green-600 dark:text-green-400">완료한 날짜</div>
            </div>
          </div>
        </div>

        {/* 격려 메시지 섹션 */}
        <div className="text-center p-3 bg-muted rounded-lg">
          {(stats?.thisWeek.completionRate || 0) >= 80 ? ( // 이번 주 완료율이 80% 이상이면
            <div className="flex items-center justify-center text-green-600">
              <HiCheckCircle className="w-5 h-5 mr-2" /> {/* 체크 완료 아이콘 */}
              <span className="text-sm font-medium">훌륭해요! 계속 이어가세요!</span> {/* 긍정적인 메시지 */}
            </div>
          ) : ( // 80% 미만이면
            <div className="flex items-center justify-center text-blue-600 dark:text-blue-400">
              <HiTrendingUp className="w-5 h-5 mr-2" /> {/* 트렌드 상승 아이콘 */}
              <span className="text-sm font-medium">조금만 더 노력하면 목표 달성!</span> {/* 격려 메시지 */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportCard; // 컴포넌트 내보내기