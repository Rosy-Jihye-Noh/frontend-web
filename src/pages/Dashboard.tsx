import React, { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import { Card } from '@/components/ui/card';
import { HiCamera, HiUser, HiChatAlt2, HiLightBulb, HiCheckCircle } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useLogStore } from '@/store/logStore';
import { useNavigate } from 'react-router-dom';
import CommunityHotPosts from '@/components/dashboard/CommunityHotPosts';
import TodayRoutineCard from '@/components/dashboard/TodayRoutineCard';
import MainFeaturesCard from '@/components/dashboard/MainFeaturesCard';
import PostureScoreCard from '@/components/dashboard/PostureScoreCard';
import WeeklyReportCard from '@/components/dashboard/WeeklyReportCard';
import axiosInstance from '@/api/axiosInstance';
import type { Routine } from '@/types/index';

const Dashboard: React.FC = () => {
  const { user } = useUserStore();
  const { todaySelectedRoutines, setTodaySelectedRoutines } = useDashboardStore();
  const { startOrLoadSession, setSelectedDate } = useLogStore();
  const navigate = useNavigate();

  // 상태
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [communityHotPosts, setCommunityHotPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 1. 루틴 불러오기
    axiosInstance.get(`/routines/user/${user.id}`)
      .then(res => setRoutines(res.data))
      .catch(console.error);

    // 2. 카테고리 불러오기 및 각 카테고리별 인기글 불러오기
    axiosInstance.get('/categories')
      .then(async res => {
        setCategories(res.data);
        // 각 카테고리별 인기글 1개씩
        const hotPosts = await Promise.all(
          res.data.map(async (cat: any) => {
            try {
              const postRes = await axiosInstance.get(`/posts/category/${cat.id}/popular`, { params: { size: 1 } });
              const post = postRes.data.content?.[0];
              return post
                ? { category: cat.name, title: post.title, likes: post.likeCount }
                : { category: cat.name, title: '', likes: 0 };
            } catch {
              return { category: cat.name, title: '', likes: 0 };
            }
          })
        );
        setCommunityHotPosts(hotPosts);
      })
      .catch(console.error);

  }, [user, navigate]);

  const handleRoutineSelection = (selectedRoutines: Routine[]) => {
    setTodaySelectedRoutines(selectedRoutines);
  };

  const handleWorkoutStart = () => {
    if (todaySelectedRoutines.length === 0) {
      alert('먼저 오늘 수행할 루틴을 선택해주세요.');
      return;
    }
    
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 오늘 날짜로 설정하고 운동기록 페이지로 이동
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    
    // 선택된 루틴으로 세션 시작
    startOrLoadSession(user.id, todaySelectedRoutines);
    
    // 운동기록 페이지로 이동
    navigate('/exercise-logs');
  };

  // 카테고리 아이콘 매핑
  const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    '오운완': <HiCheckCircle className="w-6 h-6 text-blue-500 mr-2" />,
    '자세인증': <HiCamera className="w-6 h-6 text-purple-500 mr-2" />,
    'Q&A': <HiChatAlt2 className="w-6 h-6 text-green-500 mr-2" />,
    '사용자 후기': <HiUser className="w-6 h-6 text-yellow-500 mr-2" />,
    '꿀팁': <HiLightBulb className="w-6 h-6 text-orange-400 mr-2" />,
  };
  const communityCategories = categories.map((cat: any) => ({
    key: cat.name,
    icon: CATEGORY_ICONS[cat.name] || <HiCheckCircle className="w-6 h-6 text-blue-500 mr-2" />,
  }));


  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8" style={{ paddingTop: '72px' }}>
        {/* 오늘의 운동 + 주요 기능 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TodayRoutineCard
            selectedRoutines={todaySelectedRoutines}
            allUserRoutines={routines}
            onRoutineSelect={handleRoutineSelection}
            onStart={handleWorkoutStart}
          />
          <MainFeaturesCard
            onPostureAnalysis={() => navigate('/photoupload')}
            onWorkoutRecommend={() => alert('운동 추천 이동')}
          />
        </div>
        {/* 자세 변화 그래프 + 주간 운동 리포트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PostureScoreCard />
          <WeeklyReportCard />
        </div>
        {/* 커뮤니티 인기글 (카테고리별) */}
        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-center">커뮤니티 인기글</h2>
          <CommunityHotPosts categories={communityCategories} topPosts={communityHotPosts} />
        </Card>
      </main>
      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="챗봇 열기"
      >
        <HiChatAlt2 className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Dashboard;
