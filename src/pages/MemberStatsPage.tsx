import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/common/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { fetchUserSignupStats, fetchAdminDashboard } from '@/services/api/communityApi';
import { PieChart, Pie, Cell, Legend } from 'recharts';

const months = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

// 다크모드 감지 훅
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    window.addEventListener('classChange', check);
    return () => window.removeEventListener('classChange', check);
  }, []);
  return isDark;
}

const MemberStatsPage: React.FC = () => {
  const isDark = useIsDarkMode();
  const [currentMonth, setCurrentMonth] = useState(0);
  const [signupStats, setSignupStats] = useState<number[][] | null>(null); // [ [1월주차...], ... ]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genderStats, setGenderStats] = useState<{ male: number; female: number } | null>(null);
  const [ageStats, setAgeStats] = useState<{ ageGroup: string; value: number }[] | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const year = new Date().getFullYear();
        const [signupData, dashboardData] = await Promise.all([
          fetchUserSignupStats(year),
          fetchAdminDashboard(),
        ]);
        // 가입자 통계
        const statsArr = Array(12).fill(0).map(() => [0,0,0,0,0]);
        signupData.monthly.forEach((m: any) => {
          statsArr[m.month-1] = m.weeks;
        });
        setSignupStats(statsArr);
        // 성별 통계
        setGenderStats({
          male: dashboardData.genderAnalysis.male,
          female: dashboardData.genderAnalysis.female,
        });
        // 나이 통계 - 나이대별 회원수 사용
        setAgeStats(
          dashboardData.ageGroupAnalysis.map((item: any) => ({ ageGroup: item.ageGroup, value: item.count }))
        );
      } catch (e) {
        setError('통계 데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handlePrev = () => {
    setCurrentMonth((prev) => (prev - 1 + 12) % 12);
  };
  const handleNext = () => {
    setCurrentMonth((prev) => (prev + 1) % 12);
  };

  // 차트 데이터 변환
  const chartData = signupStats
    ? signupStats[currentMonth].map((users, idx) => ({ week: `${idx+1}주차`, users }))
    : [];

  // 실제 월별 가입자 수 데이터 (signupStats에서 각 월별 합계)
  const monthlySignup = signupStats ? signupStats.map(weeks => weeks.reduce((a, b) => a + b, 0)) : [];

  const genderColors = ['#60a5fa', '#f472b6'];
  const ageColors = ['#93c5fd', '#60a5fa', '#38bdf8', '#818cf8', '#f472b6'];

  // 성별 원그래프 라벨을 원 바깥쪽에 배치하는 커스텀 함수
  const renderGenderLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index, name
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 16;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={genderColors[index % genderColors.length]}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={500}
        style={{ pointerEvents: "none" }}
      >
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // 나이대별 원그래프 라벨을 원 바깥쪽에 배치하는 커스텀 함수
  const renderAgeLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index, ageGroup
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 16;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={ageColors[index % ageColors.length]}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={500}
        style={{ pointerEvents: "none" }}
      >
        {`${ageGroup} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };
  // 나이 데이터
  const ageChartData = ageStats || [];

  // 성별 데이터
  const genderChartData = genderStats
    ? [
        { name: '남성', value: genderStats.male },
        { name: '여성', value: genderStats.female },
      ]
    : [];

  return (
    <MainLayout>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">회원 통계</h1>
      {/* 상단: 주간/월별 사용자 증가 */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
        <Card className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">주간 사용자 증가</CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={handlePrev} 
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="이전 달"
              >
                <HiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="font-semibold text-sm sm:text-base min-w-[3rem] text-center">{months[currentMonth]}</span>
              <button 
                onClick={handleNext} 
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="다음 달"
              >
                <HiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="h-48 sm:h-64 flex items-center justify-center">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400 dark:text-gray-500 text-sm sm:text-base">로딩 중...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-red-500 dark:text-red-400 text-sm sm:text-base">{error}</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#f0f0f0'} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: isDark ? '#bbb' : '#333' }} />
                    <YAxis allowDecimals={false} tickCount={5} domain={[0, 'dataMax + 10']} interval={0} tick={{ fontSize: 11, fill: isDark ? '#bbb' : '#333' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#222' : 'white', 
                        color: isDark ? '#eee' : '#333',
                        border: isDark ? '1px solid #444' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="users" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* 월 선택 인디케이터 */}
            <div className="flex justify-center gap-1.5 mt-3">
              {months.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => setCurrentMonth(idx)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${
                    idx === currentMonth ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                  }`}
                  aria-label={`${m} 선택`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">월별 사용자 증가</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="h-48 sm:h-64 flex items-center justify-center">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400 dark:text-gray-500 text-sm sm:text-base">로딩 중...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-red-500 dark:text-red-400 text-sm sm:text-base">{error}</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months.map((m, i) => ({ month: m, users: monthlySignup[i] }))} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#f0f0f0'} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? '#bbb' : '#333' }} />
                    <YAxis allowDecimals={false} tickCount={5} domain={[0, 'dataMax + 10']} interval={0} tick={{ fontSize: 11, fill: isDark ? '#bbb' : '#333' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#222' : 'white', 
                        color: isDark ? '#eee' : '#333',
                        border: isDark ? '1px solid #444' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="users" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* 중간: 성별, 나이대별 */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
        {/* 성별 원그래프 */}
        <Card className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">성별 회원 분포</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="h-48 sm:h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={genderChartData}
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={60}
                    innerRadius={20}
                    labelLine={false}
                    label={renderGenderLabel}
                  >
                    {genderChartData.map((entry, idx) => (
                      <Cell key={`cell-gender-${idx}`} fill={genderColors[idx % genderColors.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    align="center" 
                    verticalAlign="bottom" 
                    layout="horizontal"
                    wrapperStyle={{ fontSize: '12px', color: isDark ? '#eee' : '#333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* 나이대별 원그래프 */}
        <Card className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">나이대별 회원 분포</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="h-48 sm:h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={ageChartData}
                    dataKey="value" 
                    nameKey="ageGroup" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={60}
                    innerRadius={20}
                    labelLine={false}
                    label={renderAgeLabel}
                  >
                    {ageChartData.map((entry, idx) => (
                      <Cell key={`cell-age-${idx}`} fill={ageColors[idx % ageColors.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    align="center" 
                    verticalAlign="bottom" 
                    layout="horizontal"
                    wrapperStyle={{ fontSize: '12px', color: isDark ? '#eee' : '#333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MemberStatsPage; 