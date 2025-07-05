// src/components/log/ExerciseCalendar.tsx

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';

interface ExerciseCalendarProps {
  // props에서 userId 제거
}

/**
 * [수정됨] Date 객체를 시간대 문제 없이 'YYYY-MM-DD' 문자열로 변환합니다.
 * @param date - 변환할 Date 객체
 */
const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 파란색 테마의 색상 키 반환
const getCompletionLevel = (rate: number): string => {
  if (rate === 100) return 'level4';
  if (rate >= 80) return 'level3';
  if (rate >= 50) return 'level2';
  if (rate > 0) return 'level1';
  return 'level0';
};

export const ExerciseCalendar: React.FC<ExerciseCalendarProps> = () => {
  // [수정됨] userStore에서 userId 가져오기
  const { selectedDate, setSelectedDate, pastLogs, fetchPastLogs } = useLogStore();
  const { user } = useUserStore();
  
  const userId = user?.id;

  useEffect(() => {
    // [수정됨] props로 전달받은 userId를 사용
    if (userId) {
      fetchPastLogs(userId);
    }
  }, [userId, fetchPastLogs]);

  const modifiers = React.useMemo(() => {
    if (!Array.isArray(pastLogs) || !userId) return {};
    
    // 해당 사용자의 로그만 필터링
    const userLogs = pastLogs.filter(log => log.userId === userId);
    
    // 동일 날짜의 중복 로그 제거 - 날짜별로 최신 로그만 유지
    const uniqueLogsByDate = new Map<string, any>();
    userLogs.forEach(log => {
      const existingLog = uniqueLogsByDate.get(log.exerciseDate);
      if (!existingLog || new Date(log.createdAt || log.exerciseDate) > new Date(existingLog.createdAt || existingLog.exerciseDate)) {
        uniqueLogsByDate.set(log.exerciseDate, log);
      }
    });
    
    const uniqueLogs = Array.from(uniqueLogsByDate.values());
    
    // 로그 정보를 한 번만 출력하도록 조건부 로깅
    if (userLogs.length > 0) {
      console.log(`달력 표시용 사용자 ${userId}: 원본 ${userLogs.length}개 → 중복제거 후 ${uniqueLogs.length}개`);
    }
    
    const logsByDate: Record<string, { totalRate: number; count: number }> = {};
    uniqueLogs.forEach(log => {
      if (!logsByDate[log.exerciseDate]) {
        logsByDate[log.exerciseDate] = { totalRate: 0, count: 0 };
      }
      logsByDate[log.exerciseDate].totalRate += log.completionRate;
      logsByDate[log.exerciseDate].count += 1;
    });

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

  // 사용자 정보가 없는 경우 처리
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

  return (
    <Card className="shadow-sm w-full max-w-md mx-auto">
      <CardHeader><CardTitle className="text-xl text-center"></CardTitle></CardHeader>
      <CardContent className="p-3 flex justify-center">
        <Calendar
          mode="single"
          selected={new Date(`${selectedDate}T12:00:00`)}
          // [수정됨] onSelect 핸들러에서 새로운 유틸리티 함수를 사용합니다.
          onSelect={(day) => {
            if (day && userId) {
              const newDate = toYYYYMMDD(day);
              setSelectedDate(newDate);
              
              // 선택된 날짜의 모든 로그 정보 표시
              if (Array.isArray(pastLogs)) {
                const userLogs = pastLogs.filter(log => log.userId === userId);
                const logsForDate = userLogs.filter(log => log.exerciseDate === newDate);
                
                if (logsForDate.length > 0) {
                  const allCompleted = logsForDate.every(log => log.completionRate === 100);
                  const completionRates = logsForDate.map(log => log.completionRate);
                  console.log(`${newDate} 날짜 선택: ${logsForDate.length}개 로그 (완료율: ${completionRates.join(', ')}%) - ${allCompleted ? '완료' : '미완료'}`);
                } else {
                  console.log(`${newDate} 날짜 선택: 운동기록 없음`);
                }
              }
            }
          }}
          className="p-0"
          modifiers={modifiers}
          modifiersClassNames={{
            selected: 'bg-transparent border-2 border-primary text-primary rounded-md',
            today: 'bg-accent text-accent-foreground rounded-md',
            level4: 'bg-blue-500 text-white rounded-md',
            level3: 'bg-blue-400 text-white rounded-md',
            level2: 'bg-blue-300 text-blue-800 rounded-md',
            level1: 'bg-blue-200 text-blue-700 rounded-md',
          }}
        />
      </CardContent>
    </Card>
  );
};