// src/components/log/ExerciseCalendar.tsx

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';

interface ExerciseCalendarProps {}

const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCompletionLevel = (rate: number): string => {
  if (rate === 100) return 'level4';
  if (rate >= 80) return 'level3';
  if (rate >= 50) return 'level2';
  if (rate > 0) return 'level1';
  return 'level0';
};

export const ExerciseCalendar: React.FC<ExerciseCalendarProps> = () => {
  const { selectedDate, setSelectedDate, pastLogs, fetchPastLogs } = useLogStore();
  const { user } = useUserStore();
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchPastLogs(userId);
    }
  }, [userId, fetchPastLogs]);

  const modifiers = React.useMemo(() => {
    if (!Array.isArray(pastLogs) || !userId) return {};
    
    const userLogs = pastLogs.filter(log => log.userId === userId);
    
    const uniqueLogsByDate = new Map<string, any>();
    userLogs.forEach(log => {
      const existingLog = uniqueLogsByDate.get(log.exerciseDate);
      if (!existingLog || new Date(log.createdAt || log.exerciseDate) > new Date(existingLog.createdAt || existingLog.exerciseDate)) {
        uniqueLogsByDate.set(log.exerciseDate, log);
      }
    });
    
    const uniqueLogs = Array.from(uniqueLogsByDate.values());
    
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

  if (!userId) {
    return (
      <Card className="shadow-md rounded-2xl w-full max-w-md mx-auto min-h-[350px] flex items-center justify-center">
        <div className="text-center text-neutral-500 p-8">
          <p>사용자 정보를 불러오는 중입니다...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-md w-full max-w-md mx-auto rounded-2xl">
      <CardContent className="p-3 flex justify-center">
        <Calendar
          mode="single"
          selected={new Date(`${selectedDate}T12:00:00`)}
          onSelect={(day) => {
            if (day && userId) {
              const newDate = toYYYYMMDD(day);
              setSelectedDate(newDate);
            }
          }}
          className="p-0"
          modifiers={modifiers}
          modifiersClassNames={{
            selected: 'bg-transparent border-2 border-blue-500 text-blue-500 rounded-lg font-bold',
            today: 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg font-bold',
            level4: 'bg-blue-500 text-white rounded-lg',
            level3: 'bg-blue-400 text-white rounded-lg',
            level2: 'bg-blue-300 text-blue-800 dark:text-white dark:bg-blue-600 rounded-lg',
            level1: 'bg-blue-200 text-blue-700 dark:text-blue-900 dark:bg-blue-500/80 rounded-lg',
          }}
        />
      </CardContent>
    </Card>
  );
};