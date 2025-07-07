import React, { useState, useEffect } from 'react';
import apiClient from '@/api/axiosInstance';
import { MainLayout } from '@/components/common/AdminLayout';
import { PageHeader } from '@/components/common/AdminHeader';
import { StatCard } from '@/components/common/StatCard'; // StatCard 경로는 유지한다고 가정
import Pagination from '@/components/common/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, BarChart3, TrendingUp, Heart, PlusSquare } from 'lucide-react';

type DashboardData = {
  stats: { totalMembers: number; totalPosts: number; totalAnalysis: number; weeklyActiveUsers: { value: number, change: number } };
  genderAnalysis: { male: number; female: number; maxScore: number };
  ageGroupAnalysis: AgeGroupAnalysis[];
  popularByLikes: { name: string; count: number }[];
  popularByRoutine: { name: string; count: number }[];
};

type AgeGroupAnalysis = {
  ageGroup: string;
  averageScore: number;
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [likesCurrentPage, setLikesCurrentPage] = useState(0);
  const [routineCurrentPage, setRoutineCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<DashboardData>('/admin/dashboard');
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    // 로딩 중일 때 스켈레톤 UI 표시
    return (
        <MainLayout>
            <PageHeader title="관리자 대시보드" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" /><Skeleton className="h-28" />
                <Skeleton className="h-28" /><Skeleton className="h-28" />
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48" /><Skeleton className="h-48" /><Skeleton className="h-48" />
            </div>
        </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="관리자 대시보드" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="총 회원 수" value={`${data.stats.totalMembers}명`} icon={Users} />
        <StatCard title="총 게시글 수" value={`${data.stats.totalPosts}개`} icon={FileText} />
        <StatCard title="총 분석 횟수" value={`${data.stats.totalAnalysis}회`} icon={BarChart3} />
        <StatCard 
          title="주간 활성 사용자" 
          value={`${data.stats.weeklyActiveUsers.value.toLocaleString()}명`}
          icon={TrendingUp} 
          details={`${data.stats.weeklyActiveUsers.change >= 0 ? '+' : ''}${data.stats.weeklyActiveUsers.change}% vs last week`}
        />
      </div>

      {/* 성별 분석 점수 평균 */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>성별 분석 점수 평균</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">남성</span>
                    <span className="text-sm font-bold text-blue-600">{data.genderAnalysis.male.toFixed(1)}점</span>
                </div>
                <Progress value={(data.genderAnalysis.male / data.genderAnalysis.maxScore) * 100} className="h-2 [&>div]:bg-blue-500" />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">여성</span>
                    <span className="text-sm font-bold text-blue-600">{data.genderAnalysis.female.toFixed(1)}점</span>
                </div>
                <Progress value={(data.genderAnalysis.female / data.genderAnalysis.maxScore) * 100} className="h-2 [&>div]:bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* ▼▼▼ 나이대별 분석 점수 평균 카드 (신규 추가) ▼▼▼ */}
        <Card>
            <CardHeader>
            <CardTitle>나이대별 분석 점수 평균</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {data.ageGroupAnalysis.map((item) => (
                <div key={item.ageGroup}>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{item.ageGroup}</span>
                    <span className="text-sm font-bold text-teal-600">{item.averageScore.toFixed(1)}점</span>
                </div>
                {/* 점수는 100점 만점으로 가정하여 프로그레스 바 표시 */}
                <Progress value={item.averageScore} className="h-2 [&>div]:bg-teal-500" />
                </div>
            ))}
            {data.ageGroupAnalysis.length === 0 && (
                <p className="text-sm text-muted-foreground">분석 기록이 없습니다.</p>
            )}
            </CardContent>
        </Card>
      </div>

      {/* 인기 운동 섹션 */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>인기 운동 (좋아요 순)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.popularByLikes
              .slice(likesCurrentPage * itemsPerPage, (likesCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-400" />
                        <span className="font-semibold">{item.count.toLocaleString()}</span>
                    </div>
                </div>
            ))}
          </CardContent>
          {/* 좋아요 순 페이지네이션 */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex justify-center">
              <Pagination
                currentPage={likesCurrentPage}
                totalPages={Math.ceil(data.popularByLikes.length / itemsPerPage)}
                onPageChange={setLikesCurrentPage}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>인기 운동 (루틴 추가 순)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.popularByRoutine
              .slice(routineCurrentPage * itemsPerPage, (routineCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                        <PlusSquare className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-green-600">+{item.count.toLocaleString()}</span>
                    </div>
                </div>
            ))}
          </CardContent>
          {/* 루틴 추가 순 페이지네이션 */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex justify-center">
              <Pagination
                currentPage={routineCurrentPage}
                totalPages={Math.ceil(data.popularByRoutine.length / itemsPerPage)}
                onPageChange={setRoutineCurrentPage}
              />
            </div>
          </div>
        </Card>
      </div>

    </MainLayout>
  );
}