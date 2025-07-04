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
  const { 
    todaySelectedRoutines, 
    setTodaySelectedRoutines, 
    setCurrentUser, 
    getTodayRoutines, 
    clearUserData 
  } = useDashboardStore();
  const { startOrLoadSession, setSelectedDate } = useLogStore();
  const navigate = useNavigate();

  // 상태
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [communityHotPosts, setCommunityHotPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !user.id) {
      console.log('사용자가 로그인되지 않음, 로그인 페이지로 이동');
      clearUserData(); // 사용자 데이터 초기화
      navigate('/login');
      return;
    }

    // 현재 사용자 설정
    setCurrentUser(user.id);
    
    // 해당 사용자의 선택된 루틴 가져오기
    const userSelectedRoutines = getTodayRoutines(user.id);
    console.log('사용자', user.id, '의 기존 선택 루틴:', userSelectedRoutines.length, '개');

    // 1. 로그인한 사용자의 루틴만 불러오기 (인증된 사용자만)
    console.log('로그인한 사용자 ID:', user.id, '의 루틴을 가져오는 중...');
    axiosInstance.get(`/routines/user/${user.id}`)
      .then(res => {
        // 응답 데이터가 배열인지 확인하고, 해당 사용자의 루틴인지 검증
        const userRoutines = Array.isArray(res.data) ? res.data.filter((routine: any) => 
          routine.userId === user.id
        ) : [];
        console.log('사용자 루틴 로드 성공:', userRoutines.length, '개의 루틴');
        setRoutines(userRoutines);
      })
      .catch(error => {
        console.error('사용자 루틴 로드 실패:', error);
        // 인증 오류인 경우 로그인 페이지로 이동
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('인증 오류로 인한 로그인 페이지 이동');
          clearUserData();
          navigate('/login');
        }
        setRoutines([]);
      });

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
    // 로그인한 사용자 확인
    if (!user || !user.id) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 선택된 루틴이 모두 해당 사용자의 루틴인지 검증
    const validSelectedRoutines = selectedRoutines.filter(selectedRoutine => 
      routines.some(userRoutine => userRoutine.id === selectedRoutine.id)
    );

    if (validSelectedRoutines.length !== selectedRoutines.length) {
      console.warn('유효하지 않은 루틴 선택 시도');
      alert('선택할 수 없는 루틴이 포함되어 있습니다.');
      return;
    }

    console.log('사용자', user.id, '의 루틴 선택:', validSelectedRoutines.map(r => r.name));
    setTodaySelectedRoutines(validSelectedRoutines, user.id);
  };

  const handleWorkoutStart = () => {
    // 사용자 인증 확인
    if (!user || !user.id) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (todaySelectedRoutines.length === 0) {
      alert('먼저 오늘 수행할 루틴을 선택해주세요.');
      return;
    }
    
    // 선택된 루틴이 실제로 해당 사용자의 루틴인지 확인
    const validRoutines = todaySelectedRoutines.filter(routine => 
      routines.some(userRoutine => userRoutine.id === routine.id)
    );
    
    if (validRoutines.length !== todaySelectedRoutines.length) {
      console.warn('유효하지 않은 루틴이 포함되어 있습니다.');
      alert('유효하지 않은 루틴이 포함되어 있습니다. 다시 선택해주세요.');
      return;
    }

    console.log('사용자', user.id, '의 운동 세션 시작:', validRoutines.map(r => r.name));

    // 오늘 날짜로 설정하고 운동기록 페이지로 이동
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    
    // 검증된 루틴으로 세션 시작
    startOrLoadSession(user.id, validRoutines);
    
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
