import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';

interface ExerciseCalendarProps {
}

/**
 * Date 객체를 시간대(timezone) 문제 없이 'YYYY-MM-DD' 형식의 문자열로 변환합니다.
 * 이는 날짜 선택 시 발생할 수 있는 클라이언트-서버 간 시간대 불일치 문제를 방지합니다.
 * @param date - 변환할 Date 객체
 * @returns {string} 'YYYY-MM-DD' 형식의 날짜 문자열
 */
const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 주어진 완료율(rate)에 따라 달력에 표시할 색상 레벨 키를 반환합니다.
 * 이 키는 Tailwind CSS의 `modifiersClassNames`와 연결되어 색상을 동적으로 적용합니다.
 * @param rate - 운동 완료율 (0-100)
 * @returns {string} 색상 레벨을 나타내는 문자열 (level0 ~ level4)
 */
const getCompletionLevel = (rate: number): string => {
  if (rate === 100) return 'level4'; // 100% 완료: 가장 진한 파란색
  if (rate >= 80) return 'level3';   // 80% 이상: 다음으로 진한 파란색
  if (rate >= 50) return 'level2';   // 50% 이상: 중간 파란색
  if (rate > 0) return 'level1';     // 0% 초과: 연한 파란색 (부분 완료)
  return 'level0';                   // 0% (로그 없음 또는 미완료): 기본 색상
};

// ExerciseCalendar 함수형 컴포넌트 정의
export const ExerciseCalendar: React.FC<ExerciseCalendarProps> = () => {
  // `useLogStore`에서 현재 선택된 날짜, 날짜 설정 함수, 과거 로그, 과거 로그 불러오기 함수를 가져옵니다.
  const { selectedDate, setSelectedDate, pastLogs, fetchPastLogs } = useLogStore();
  // `useUserStore`에서 현재 로그인된 사용자 정보를 가져옵니다.
  const { user } = useUserStore();
  
  const userId = user?.id;

  // 컴포넌트 마운트 또는 `userId`가 변경될 때 과거 운동 로그를 불러오는 useEffect 훅
  useEffect(() => {
    if (userId) {
      fetchPastLogs(userId);
    }
  }, [userId, fetchPastLogs]);

  // 달력에 색상을 적용하기 위한 `modifiers` 객체를 생성하는 useMemo 훅
  const modifiers = React.useMemo(() => {
    if (!Array.isArray(pastLogs) || !userId) return {};
    
    const userLogs = pastLogs.filter(log => log.userId === userId);
    
    // 동일 날짜의 중복 로그를 제거하고, 각 날짜별로 가장 최신 로그만 유지
    const uniqueLogsByDate = new Map<string, any>();
    userLogs.forEach(log => {
      const existingLog = uniqueLogsByDate.get(log.exerciseDate);
      if (!existingLog || new Date(log.createdAt || log.exerciseDate) > new Date(existingLog.createdAt || existingLog.exerciseDate)) {
        uniqueLogsByDate.set(log.exerciseDate, log);
      }
    });
    
    // Map의 값(value)들을 배열로 변환하여 고유한 로그 목록을 만듭니다.
    const uniqueLogs = Array.from(uniqueLogsByDate.values());
    
    // 각 날짜별로 완료율의 합계와 로그 개수를 저장할 객체 초기화
    const logsByDate: Record<string, { totalRate: number; count: number }> = {};
    uniqueLogs.forEach(log => {
      if (!logsByDate[log.exerciseDate]) {
        logsByDate[log.exerciseDate] = { totalRate: 0, count: 0 };
      }
      logsByDate[log.exerciseDate].totalRate += log.completionRate; // 완료율 합산
      logsByDate[log.exerciseDate].count += 1; // 로그 개수 증가
    });

    // `modifiers` 객체 생성
    const mods: Record<string, Date[]> = {};
    Object.keys(logsByDate).forEach(dateStr => {
      const logDate = new Date(`${dateStr}T12:00:00`); 
      const avgCompletion = logsByDate[dateStr].totalRate / logsByDate[dateStr].count;
      const levelKey = getCompletionLevel(avgCompletion);
      
      if (!mods[levelKey]) mods[levelKey] = [];
      mods[levelKey].push(logDate);
    });

    return mods;
  }, [pastLogs, userId]);

  // 사용자 ID가 없는 경우 (로그인되지 않은 상태) 로딩 또는 안내 메시지 표시
  if (!userId) {
    return (
      <Card className="shadow-sm w-full max-w-md mx-auto">
        <CardHeader><CardTitle className="text-xl text-center"></CardTitle></CardHeader>
        <CardContent className="p-3 flex justify-center">
          <div className="text-center text-gray-500 py-8">
            <p>사용자 정보를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 사용자 ID가 있을 경우 실제 달력 UI 렌더링
  return (
    <Card className="shadow-sm w-full max-w-md mx-auto">
      <CardHeader><CardTitle className="text-xl text-center"></CardTitle></CardHeader>
      <CardContent className="p-3 flex justify-center">
        <Calendar
          mode="single"
          selected={new Date(`${selectedDate}T12:00:00`)}
          // 날짜 선택 핸들러
          onSelect={(day) => {
            if (day && userId) { // 날짜가 선택되었고 사용자 ID가 유효하면
              const newDate = toYYYYMMDD(day); // 선택된 날짜를 'YYYY-MM-DD' 형식으로 변환
              setSelectedDate(newDate); // `useLogStore`의 `setSelectedDate` 함수를 호출하여 전역 상태 업데이트
              
              // 선택된 날짜의 로그 정보 디버깅용 출력
              if (Array.isArray(pastLogs)) {
                const userLogs = pastLogs.filter(log => log.userId === userId); // 현재 사용자의 로그만 필터링
                const logsForDate = userLogs.filter(log => log.exerciseDate === newDate); // 선택된 날짜의 로그 필터링
                
                if (logsForDate.length > 0) {
                  const allCompleted = logsForDate.every(log => log.completionRate === 100); // 모든 로그가 완료되었는지 확인
                  const completionRates = logsForDate.map(log => log.completionRate); // 각 로그의 완료율 배열
                  console.log(`${newDate} 날짜 선택: ${logsForDate.length}개 로그 (완료율: ${completionRates.join(', ')}%) - ${allCompleted ? '완료' : '미완료'}`);
                } else {
                  console.log(`${newDate} 날짜 선택: 운동기록 없음`);
                }
              }
            }
          }}
          className="p-0"
          modifiers={modifiers} // 위에서 계산된 `modifiers` 객체를 달력에 전달하여 날짜에 색상 적용
          modifiersClassNames={{ // 각 `level` 키에 대한 실제 CSS 클래스 정의
            selected: 'bg-transparent border-2 border-primary text-primary rounded-md',
            today: 'bg-accent text-accent-foreground rounded-md',
            level4: 'bg-blue-500 text-white rounded-md', 
            level3: 'bg-blue-400 text-white rounded-md', 
            level2: 'bg-blue-300 dark:bg-blue-400 text-blue-800 dark:text-white rounded-md', 
            level1: 'bg-blue-200 dark:bg-blue-300 text-blue-700 dark:text-blue-900 rounded-md', 
          }}
        />
      </CardContent>
    </Card>
  );
};