import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Progress } from '@/components/ui/progress';
import { HiOutlineCalendar, HiOutlineTrendingUp, HiOutlineCheckCircle, HiOutlineFlag } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';
import axiosInstance from '@/api/axiosInstance';
import type { Goal, ProfileUser } from '@/types/index';

interface ReportStats {
  thisWeekCompleted: number;
  thisMonthCompleted: number;
  thisMonthTotalDays: number;
  thisMonthCompletionRate: number;
}

const WeeklyReportCard: React.FC = () => {
  const { user } = useUserStore();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [aiGoal, setAiGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const [profileResponse, logsResponse] = await Promise.all([
          axiosInstance.get<ProfileUser>(`/users/${user.id}`),
          axiosInstance.get(`/logs/user/${user.id}`)
        ]);

        const userProfile = profileResponse.data;
        if (userProfile?.weeklyGoal) {
          try {
            setAiGoal(JSON.parse(userProfile.weeklyGoal));
          } catch (e) {
            console.error("AI 주간 목표 파싱 실패:", e);
            setAiGoal(null);
          }
        }

        const allLogs = logsResponse.data || [];
        const now = new Date();

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const weekData = allLogs.filter((log: any) => new Date(log.exerciseDate) >= startOfWeek);
        
        const weekLogsByDate = weekData.reduce((acc: Record<string, any[]>, log: any) => {
          acc[log.exerciseDate] = acc[log.exerciseDate] || [];
          acc[log.exerciseDate].push(log);
          return acc;
        }, {});

        const thisWeekCompleted = Object.keys(weekLogsByDate).length;

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthData = allLogs.filter((log: any) => new Date(log.exerciseDate) >= startOfMonth);
        const monthLogsByDate = monthData.reduce((acc: Record<string, any[]>, log: any) => {
            acc[log.exerciseDate] = acc[log.exerciseDate] || [];
            acc[log.exerciseDate].push(log);
            return acc;
        }, {});
        const thisMonthCompleted = Object.keys(monthLogsByDate).length;
        const thisMonthTotalDays = now.getDate();
        const thisMonthCompletionRate = thisMonthTotalDays > 0 ? Math.round((thisMonthCompleted / thisMonthTotalDays) * 100) : 0;

        setStats({ thisWeekCompleted, thisMonthCompleted, thisMonthTotalDays, thisMonthCompletionRate });

      } catch (error) {
        console.error('리포트 데이터 로드 실패:', error);
        setStats({ thisWeekCompleted: 0, thisMonthCompleted: 0, thisMonthTotalDays: new Date().getDate(), thisMonthCompletionRate: 0 });
        setAiGoal(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [user]);

  const weeklyProgress = aiGoal && aiGoal.workouts > 0 ? ((stats?.thisWeekCompleted || 0) / aiGoal.workouts) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center p-6 shadow-md rounded-2xl bg-card min-h-[300px]">
        <div className="flex flex-col items-center text-muted-foreground">
          <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mb-3"></div>
          <p>리포트 로딩 중...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-md rounded-2xl bg-card">
      <CardHeader className="p-0 mb-6">
        <div className="flex items-center gap-3">
          <HiOutlineCalendar className="w-7 h-7 text-[#007AFF]" />
          <div>
            <CardTitle className="text-lg font-bold text-foreground">운동 리포트</CardTitle>
            <CardDescription>주간 및 월간 진행 상황입니다.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-md text-foreground flex items-center gap-2">
              <HiOutlineTrendingUp className="w-5 h-5 text-[#007AFF]" />
              주간 목표
            </h3>
            {aiGoal && (
              <Badge variant="outline" className="border-[#007AFF]/50 text-[#007AFF]">
                AI 목표: {aiGoal.completion_rate}%
              </Badge>
            )}
          </div>
          {aiGoal ? (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-3">
                이번 주 목표는 <strong className="text-foreground">{aiGoal.workouts}회</strong> 운동입니다.
              </p>
              <Progress value={weeklyProgress} className="h-2 [&>*]:bg-[#007AFF]" />
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-muted-foreground">{stats?.thisWeekCompleted || 0} / {aiGoal.workouts}일</span>
                <span className="font-bold text-[#007AFF]">{weeklyProgress.toFixed(0)}%</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4 rounded-lg bg-muted/50">
              AI 주간 목표가 설정되지 않았습니다.
            </div>
          )}
        </div>

        <div className="space-y-2">
           <h3 className="font-semibold text-md text-foreground flex items-center gap-2">
              <HiOutlineFlag className="w-5 h-5 text-green-500" />
              월간 출석률
            </h3>
           <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">완료일</p>
                <p className="text-2xl font-bold text-foreground">{stats?.thisMonthCompleted || 0} <span className="text-lg font-medium text-muted-foreground">/ {stats?.thisMonthTotalDays || 0}일</span></p>
              </div>
              <div className="text-right">
                 <p className="text-sm text-muted-foreground">달성률</p>
                 <p className="text-2xl font-bold text-green-500">{stats?.thisMonthCompletionRate ?? 0}%</p>
              </div>
           </div>
        </div>

        <div className="text-center p-3 bg-muted rounded-lg text-sm font-medium text-muted-foreground">
          {weeklyProgress >= 100 ? (
            <p className="flex items-center justify-center text-green-500">
              <HiOutlineCheckCircle className="w-5 h-5 mr-2" />
              주간 목표 달성! 정말 대단해요!
            </p>
          ) : (
            <p className="flex items-center justify-center text-[#007AFF]">
               <HiOutlineTrendingUp className="w-5 h-5 mr-2" />
               목표를 향해 꾸준히 나아가고 있어요!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyReportCard;