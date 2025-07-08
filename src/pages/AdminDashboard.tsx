import React, { useState, useEffect } from 'react';
import apiClient from '@/api/axiosInstance';
import { MainLayout } from '@/components/common/AdminLayout';
import { PageHeader } from '@/components/common/AdminHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialProgress } from '@/components/ui/radial-progress';
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { GroupedBarChart } from '@/components/ui/grouped-bar-chart';
import type { GroupedBarChartDataItem } from '@/components/ui/grouped-bar-chart';


// 👇 Updated data types to include analysis counts
type DashboardData = {
  stats: {
    totalMembers: number;
    totalPosts: number;
    totalAnalysis: number;
    weeklyActiveUsers: { value: number; change: number };
  };
  genderAnalysis: {
    male: number;
    female: number;
    maxScore: number;
    maleCount: number;   // New field
    femaleCount: number; // New field
  };
  ageGroupAnalysis: AgeGroupAnalysis[];
};

type AgeGroupAnalysis = {
  ageGroup: string;
  averageScore: number;
  count: number; // New field
};

type GenderDistribution = {
  gender: string;
  analysisCount: number;
  userCount: number;
};

type AgeGroupDistributionItem = {
  ageGroup: string;         // Matches 'ageGroup' from your new data
  analysisCount: string;    // Matches 'analysisCount' from your new data
  userCount: number;
};

type AnalysisDistributionResponse = {
  genderDistribution: GenderDistribution[];
  ageGroupDistribution: AgeGroupDistributionItem[];
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [genderDistData, setGenderDistData] = useState<GroupedBarChartDataItem[]>([]);
  const [ageDistData, setAgeDistData] = useState<GroupedBarChartDataItem[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<DashboardData>('/admin/dashboard');
        console.log('Received main dashboard data:', response.data); // Keep this line
        console.log('Age Group Analysis Data:', response.data.ageGroupAnalysis); // Add this line
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchDistributionData = async () => {
      try {
        const response = await apiClient.get<AnalysisDistributionResponse>('/admin/analysis-distribution');
        const { genderDistribution, ageGroupDistribution } = response.data; // Destructure ageGroupDistribution

        // --- Process Gender Distribution Data ---
        const processedGenderData: { [key: string]: GroupedBarChartDataItem } = {};
        
        genderDistribution.forEach(item => {
          const key = `${item.analysisCount} 분석`; // Label for x-axis
          if (!processedGenderData[key]) {
            processedGenderData[key] = { name: key };
          }
          const genderKey = item.gender === 'MALE' ? '남성' : '여성';
          processedGenderData[key][genderKey] = item.userCount;
        });
        
        const chartGenderData = Object.values(processedGenderData).sort((a, b) => parseInt(a.name) - parseInt(b.name));
        setGenderDistData(chartGenderData);

        // --- Process Age Group Distribution Data ---
        const processedAgeData: { [key: string]: GroupedBarChartDataItem } = {};

        ageGroupDistribution.forEach(item => {
          // Use 'item.analysisCount' from the new data structure
          const key = `${item.analysisCount}`; // e.g., "0회", "2회", "3회 이상"
          if (!processedAgeData[key]) {
            processedAgeData[key] = { name: key };
          }
          // Use 'item.ageGroup' from the new data structure
          processedAgeData[key][item.ageGroup] = item.userCount;
        });

        // Ensure all age groups are represented in each bar, even if their count is 0
        const allAgeGroups = ['10대', '20대', '30대', '40대', '50대 이상'];
        const chartAgeData = Object.values(processedAgeData).map(item => {
          const newItem = { ...item };
          allAgeGroups.forEach(group => {
            if (newItem[group] === undefined) {
              newItem[group] = 0; // Initialize missing age groups to 0
            }
          });
          return newItem;
        }).sort((a, b) => {
            // Custom sort for analysisCount to handle "0회", "1회", "2회", "3회 이상"
            const parseCount = (countStr: string) => {
                if (countStr === "3회 이상") return Infinity; // Put "3회 이상" at the end
                return parseInt(countStr.replace('회', ''));
            };
            return parseCount(a.name) - parseCount(b.name);
        });

        setAgeDistData(chartAgeData);

      } catch (error) {
        console.error("Failed to fetch distribution data:", error);
      }
    };
    
    fetchDashboardData();
    fetchDistributionData();
  }, []);

  if (loading || !data) {
    // Skeleton UI for loading state
    return (
      <MainLayout>
        <PageHeader title="Admin Dashboard" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" /><Skeleton className="h-28" />
          <Skeleton className="h-28" /><Skeleton className="h-28" />
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-56" /><Skeleton className="h-56" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Admin Dashboard" />
      
      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="총 회원 수" value={`${data.stats.totalMembers} 명`} icon={Users} />
        <StatCard title="총 게시글 수" value={`${data.stats.totalPosts} 개`} icon={FileText} />
        <StatCard title="총 분석 횟수" value={`${data.stats.totalAnalysis} 회`} icon={BarChart3} />
        <StatCard 
          title="주간 활성 사용자" 
          value={`${data.stats.weeklyActiveUsers.value.toLocaleString()} 명`}
          icon={TrendingUp} 
          details={`${data.stats.weeklyActiveUsers.change >= 0 ? '+' : ''}${data.stats.weeklyActiveUsers.change}% vs last week`}
        />
      </div>

      {/* 분석 섹션 */}
      <div className="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>성별 분석</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 items-center justify-items-center pt-4">
            <div className="flex flex-col items-center gap-2">
              <RadialProgress 
                value={data.genderAnalysis.male} 
                max={data.genderAnalysis.maxScore} 
                className="text-blue-500"
              />
              <span className="text-sm font-medium text-foreground">남성 평균 점수</span>
              {/* 👇 Display male analysis count */}
              <span className="text-xs text-muted-foreground">
                {data.genderAnalysis.maleCount.toLocaleString()}회 분석
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RadialProgress 
                value={data.genderAnalysis.female} 
                max={data.genderAnalysis.maxScore} 
                className="text-pink-500"
              />
              <span className="text-sm font-medium text-foreground">여성 평균 점수</span>
              {/* 👇 Display female analysis count */}
              <span className="text-xs text-muted-foreground">
                {data.genderAnalysis.femaleCount.toLocaleString()}회 분석
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>나이대별 분석</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-2 items-center justify-items-center pt-4">
            {data.ageGroupAnalysis.map((item) => {
              let colorClass = "text-blue-300";
              switch (item.ageGroup) {
                case "10대": colorClass = "text-blue-300"; break;
                case "20대": colorClass = "text-blue-400"; break;
                case "30대": colorClass = "text-blue-500"; break;
                case "40대": colorClass = "text-blue-600"; break;
                default: colorClass = "text-blue-800"; break;
              }

              // count 값을 렌더링하기 전에 유효성 검사 추가
              const displayCount = (typeof item.count === 'number' && !isNaN(item.count))
                ? `${item.count.toLocaleString()}회 분석`
                : '분석 없음'; // 또는 빈 문자열 ''

              return (
                <div key={item.ageGroup} className="flex flex-col items-center gap-2">
                  <RadialProgress
                    value={item.averageScore}
                    max={110}
                    size={110}
                    strokeWidth={8}
                    className={colorClass}
                  />
                  <span className="text-sm font-medium text-foreground">{item.ageGroup} 평균 점수</span>
                  {/* 👇 Display age group analysis count with explicit check */}
                  <span className="text-xs text-muted-foreground">
                    {displayCount}
                  </span>
                </div>
              );
            })}
            {data.ageGroupAnalysis.length === 0 && (
              <p className="col-span-full text-center text-sm text-muted-foreground">
                분석 기록이 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- ✨ 분석 횟수 분포 차트 섹션 --- */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>성별 분석 횟수 분포</CardTitle>
            <p className="text-sm text-muted-foreground">
              분석 횟수별 사용자(명) 분포를 보여줍니다.
            </p>
          </CardHeader>
          <CardContent>
            {genderDistData.length > 0 ? (
              <GroupedBarChart 
                data={genderDistData}
                keys={['남성', '여성']}
                colors={['#93c5fd', '#f9a8d4']}
              />
            ) : (
                <div className="flex h-[300px] items-center justify-center">
                  <p className="text-center text-sm text-muted-foreground">분석 기록이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>나이대별 분석 횟수 분포</CardTitle>
            <p className="text-sm text-muted-foreground">
              분석 횟수별 사용자(명) 분포를 보여줍니다.
            </p>
          </CardHeader>
          <CardContent>
            {ageDistData.length > 0 ? (
              <GroupedBarChart 
                data={ageDistData}
                keys={['10대', '20대', '30대', '40대', '50대 이상']}
                colors={['#a7f3d0', '#67e8f9', '#93c5fd', '#c4b5fd', '#f9a8d4']} // Teal, Cyan, Blue, Violet, Pink
              />
            ) : (
                <div className="flex h-[300px] items-center justify-center">
                  <p className="text-center text-sm text-muted-foreground">분석 기록이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}