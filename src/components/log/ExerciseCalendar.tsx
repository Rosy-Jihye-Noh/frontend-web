// src/components/log/ExerciseCalendar.tsx

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useLogStore } from '@/store/logStore';

interface ExerciseCalendarProps {
  userId: number;
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

export const ExerciseCalendar: React.FC<ExerciseCalendarProps> = ({ userId }) => {
  // [수정됨] useUserStore 의존성 제거
  const { selectedDate, setSelectedDate, pastLogs, fetchPastLogs } = useLogStore();

  useEffect(() => {
    // [수정됨] props로 전달받은 userId를 사용
    if (userId) {
      console.log('달력에서 사용자', userId, '의 기록을 가져오는 중...');
      fetchPastLogs(userId);
    }
  }, [userId, fetchPastLogs]);

  const modifiers = React.useMemo(() => {
    if (!Array.isArray(pastLogs)) return {};
    
    // 해당 사용자의 로그만 필터링
    const userLogs = pastLogs.filter(log => log.userId === userId);
    console.log('달력 표시용 사용자', userId, '로그:', userLogs.length, '개');
    
    const logsByDate: Record<string, { totalRate: number; count: number }> = {};
    userLogs.forEach(log => {
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

  return (
    <Card className="shadow-sm w-full max-w-md mx-auto">
      <CardHeader><CardTitle className="text-xl text-center"></CardTitle></CardHeader>
      <CardContent className="p-3 flex justify-center">
        <Calendar
          mode="single"
          selected={new Date(`${selectedDate}T12:00:00`)}
          // [수정됨] onSelect 핸들러에서 새로운 유틸리티 함수를 사용합니다.
          onSelect={(day) => day && setSelectedDate(toYYYYMMDD(day))}
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