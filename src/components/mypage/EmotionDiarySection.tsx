import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useEmotionLogStore } from '@/store/emotionLogStore';
import { useUserStore } from '@/store/userStore';
import type { EmotionLogDTO, EmotionType } from '@/types/index';
import { EMOTION_CONFIG } from '@/config/emotionConfig';

const EmotionDiarySection: React.FC = () => {
  const { user } = useUserStore();
  const userId = user?.id;
  const {
    emotionLogs,
    selectedDate,
    setSelectedDate,
    fetchEmotionLogs,
  } = useEmotionLogStore();

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    if (userId) {
      fetchEmotionLogs(userId);
    }
  }, [userId, fetchEmotionLogs]);

  const logsByDate = useMemo(() => {
    const map = new Map<string, EmotionLogDTO>();
    emotionLogs.forEach(log => {
      if (log && log.exerciseDate) {
        map.set(log.exerciseDate.toString().split('T')[0], log);
      }
    });
    return map;
  }, [emotionLogs]);

  const selectedLog = logsByDate.get(selectedDate);

  const weeklyStats = useMemo(() => {
    const weekly: { [key in EmotionType]?: number } = {};
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    emotionLogs.forEach(log => {
      if (!log.emotion) return; // emotion 값이 없는 데이터는 건너뜁니다.
      const emotionKey = log.emotion as EmotionType;
      const logDate = new Date(log.exerciseDate);
      if (logDate >= startOfWeek) weekly[emotionKey] = (weekly[emotionKey] || 0) + 1;
    });
    return weekly;
}, [emotionLogs]);

  const monthlyStats = useMemo(() => {
    const monthly: { [key in EmotionType]?: number } = {};
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    emotionLogs.forEach(log => {
      const logDate = new Date(log.exerciseDate);
      if (logDate >= startOfMonth && logDate < new Date(now.getFullYear(), now.getMonth() + 1, 1)) {
        monthly[(log.emotion)] = (monthly[(log.emotion)] || 0) + 1;
      }
    });
    return monthly;
  }, [emotionLogs]);

    const renderPieChart = (data: { [key in EmotionType]?: number }) => {
    const chartData = Object.entries(data)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name: EMOTION_CONFIG[name as EmotionType]?.label,
        value,
        color: EMOTION_CONFIG[name as EmotionType]?.color,
        src: EMOTION_CONFIG[name as EmotionType]?.src,
      })).filter(item => item.name);

    if (chartData.length === 0) {
      return <div className="text-center text-gray-400 py-4">기록이 없습니다.</div>;
    }

    return (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={105}
            dataKey="value"
            nameKey="name"
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const safeMidAngle = midAngle ?? 0;
              const x = cx + radius * Math.cos(-safeMidAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-safeMidAngle * (Math.PI / 180));
              const entry = typeof index === 'number' ? chartData[index] : undefined;

              if (!entry) return null;

              return (
                <g>
                  <image
                    href={entry.src}
                    x={x - 37}
                    y={y - 20}
                    width="50"
                    height="50"
                  />
                  <text
                    x={x + 7}
                    y={y - 5}
                    fill="white"
                    textAnchor="start"
                    dominantBaseline="central"
                    fontSize="12"
                  >
                    {`${((percent ?? 0) * 100).toFixed(0)}%`}
                  </text>
                </g>
              );
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayHeadings = ['월', '화', '수', '목', '금', '토', '일'];

    return (
      <>
        <div className="bg-card rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-5">
            <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="p-1 rounded-full hover:bg-muted"><ChevronLeft size={16} /></button>
            <h3 className="text-sm font-semibold">{`${year}년 ${month + 1}월`}</h3>
            <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="p-1 rounded-full hover:bg-muted"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-1">
            {dayHeadings.map(day => <div key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm text-center">
            {Array(firstDay === 0 ? 6 : firstDay - 1).fill(null).map((_, index) => <div key={`empty-${index}`}></div>)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasLog = logsByDate.has(dateStr);
              const log = logsByDate.get(dateStr);
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative cursor-pointer rounded-sm flex flex-col items-center justify-center h-20 ${isSelected ? 'bg-blue-300 text-white' : 'hover:bg-muted'}`}
                >
                  <span>{day}</span>
                  {hasLog && log && (
                    <img
                      src={EMOTION_CONFIG[(log.emotion)].src}
                      alt={EMOTION_CONFIG[(log.emotion)].label}
                      className="relative bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-17" // Centered image
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow p-4 h-[200px] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">전체 기록</h2>
          {emotionLogs.length > 0 ? (
              [...emotionLogs]
                .sort((a, b) => new Date(b.exerciseDate).getTime() - new Date(a.exerciseDate).getTime())
                .map(log => {
                  if (!log || !log.emotion) {
                    return null;
                  }
                  const emotionKey = log.emotion.toString().toUpperCase() as EmotionType;
                  const config = EMOTION_CONFIG[emotionKey];
                  if (!config) {
                    return null;
                  }

                  return (
                    <div key={log.id} className="py-2 border-b last:border-b-0 flex items-center text-sm">
                      <img src={config.src} alt={config.label} className="w-7 h-10 mr-3" />
                      <div className="flex-grow">
                        <p className="text-gray-700 truncate">{log.memo}</p>
                        <p className="text-xs text-gray-500">{log.exerciseDate.toString().slice(0, 10)}</p>
                      </div>
                    </div>
                );
              })
          ) : (
            <p className="text-center text-gray-400 py-4">기록이 없습니다.</p>
          )}
        </div>
      </>
    );
  };

  const memoizedPieChart = useMemo(() => {
    return activeTab === 'weekly' ? renderPieChart(weeklyStats) : renderPieChart(monthlyStats);
  }, [activeTab, weeklyStats, monthlyStats]);

  if (!userId) {
    return <div className="p-6 text-center text-gray-500">로그인이 필요합니다.</div>;
  }

  return (
    <div className="bg-muted/40 p-6 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 달력 */}
      <div className="md:col-span-1">
        {renderCalendar()}
      </div>

      {/* 오른쪽 카드들 */}
      <div className="md:col-span-1 flex flex-col gap-4">
        {/* 오늘의 감정 */}
        <div className="bg-card border-2 border-blue-200 rounded-lg shadow p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-5">오늘의 감정</h2>
          {selectedLog ? (
            <>
              <img
                src={EMOTION_CONFIG[(selectedLog.emotion)].src}
                alt={EMOTION_CONFIG[(selectedLog.emotion)].label}
                className="w-32 h-44"
              />
              <p className="text-sm text-gray-700 italic text-center">"{selectedLog.memo}"</p>
            </>
          ) : (
            <p className="text-center text-gray-400 py-4">선택된 날짜의 기록이 없습니다.</p>
          )}
        </div>

        {/* 감정 통계 */}
        <div className="bg-card rounded-lg shadow p-4 h-[400px]">
          <h2 className="text-lg font-semibold mb-2">감정 통계</h2>
          <div className="flex justify-around mb-2 p-3">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1 rounded-full text-sm ${activeTab === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              이번 달
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1 rounded-full text-sm ${activeTab === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              이번 주
            </button>
          </div>
          {memoizedPieChart}
        </div>
      </div>
    </div>
  );
};

export default EmotionDiarySection;