import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HiCamera, HiUser, HiChatAlt2, HiLightBulb, HiCheckCircle } from 'react-icons/hi';
import { FaArrowRight } from 'react-icons/fa';
import { useUserStore } from '@/store/userStore';
import { useLogStore } from '@/store/logStore';
import CommunityHotPosts from '@/components/dashboard/CommunityHotPosts';
import TodayRoutineCard from '@/components/dashboard/TodayRoutineCard';
import PostureScoreChart from '@/components/dashboard/PostureScoreChart';
import WeeklyReportCard from '@/components/dashboard/WeeklyReportCard';
import PopularLikedExercisesCarousel from '@/components/dashboard/PopularLikedExercisesCarousel';
import PopularRoutineExercisesCarousel from '@/components/dashboard/PopularRoutineExercisesCarousel';
import { fetchCategories, fetchPopularPostsByCategory } from '@/services/api/communityApi';
import { getRoutinesByUser } from '@/services/api/routineApi';
import type { Routine } from '@/types/index';
import Favicon from '../../public/favicon.png';

const Dashboard: React.FC = () => {
  const { user } = useUserStore();
  const { sessions, startOrLoadSession, setSelectedDate } = useLogStore();
  const navigate = useNavigate();

  const [allUserRoutines, setAllUserRoutines] = useState<Routine[]>([]);
  const [displayRoutines, setDisplayRoutines] = useState<Routine[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [communityHotPosts, setCommunityHotPosts] = useState<any[]>([]);

  // ===== ▼▼▼ 데이터 로딩 및 동기화 로직 (최종 수정) ▼▼▼ =====
  useEffect(() => {
    if (!user || !user.id) {
      navigate('/login');
      return;
    }

    // 1. 로컬 스토리지에서 직접 데이터를 읽어오는 함수
    const getInitialRoutinesFromStorage = (allRoutines: Routine[]): Routine[] => {
      try {
        const logData = localStorage.getItem('exercise-log-storage');
        if (!logData) return [];

        const parsedData = JSON.parse(logData);
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = parsedData?.state?.sessions?.[today];
        if (!todaySessions || !Array.isArray(todaySessions) || todaySessions.length === 0) {
          return [];
        }
        
        const routineIds = todaySessions.map((session: any) => session.routineId).filter(Boolean);
        const selected = allRoutines.filter(routine => routineIds.includes(routine.id));
        console.log(`[초기 로딩] 로컬 스토리지에서 ${selected.length}개의 루틴을 찾았습니다.`);
        return selected;
      } catch (error) {
        console.error("로컬 스토리지에서 초기 루틴을 가져오는 중 오류 발생:", error);
        return [];
      }
    };

    // 2. API를 통해 사용자의 모든 루틴 목록을 가져온 후, 로컬 스토리지와 동기화
    getRoutinesByUser(user.id).then(fetchedRoutines => {
      setAllUserRoutines(fetchedRoutines);
      
      // API 호출이 완료된 후, 로컬 스토리지에서 데이터를 읽어 초기 상태를 설정합니다.
      const initialSelectedRoutines = getInitialRoutinesFromStorage(fetchedRoutines);
      setDisplayRoutines(initialSelectedRoutines);
    }).catch(error => {
        console.error('사용자 루틴 로드 실패:', error);
    });

    // 커뮤니티 데이터 로딩
    fetchCategories()
      .then(async categories => {
        setCategories(categories);
        const hotPosts = await Promise.all(
          categories.map(async (cat: any) => {
            try {
              const postRes = await fetchPopularPostsByCategory(cat.id, 0, 1);
              const post = postRes.content?.[0];
              return post ? { category: cat.name, title: post.title, likes: post.likeCount, id: post.id } : null;
            } catch { return null; }
          })
        );
        setCommunityHotPosts(hotPosts.filter(Boolean));
      })
      .catch(console.error);
      
  }, [user, navigate]);


  // 3. 사용자가 루틴을 변경하는 등 실시간 상호작용이 있을 때를 위한 동기화
  //    (초기 로딩 이후의 변경사항을 담당)
  useEffect(() => {
    if (allUserRoutines.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const todaySession = sessions[today] || [];
    const currentlySelected = allUserRoutines.filter(routine =>
      todaySession.some(sessionItem => sessionItem.routineId === routine.id)
    );

    // 데이터 불일치를 방지하기 위해 현재 화면 상태와 스토어 상태가 다를 때만 업데이트
    if (JSON.stringify(displayRoutines.map(r => r.id).sort()) !== JSON.stringify(currentlySelected.map(r => r.id).sort())) {
        console.log('[실시간 동기화] 세션 변경을 감지하여 화면을 업데이트합니다.');
        setDisplayRoutines(currentlySelected);
    }
  }, [sessions, allUserRoutines]);

  const handleRoutineSelection = (selectedRoutines: Routine[]) => {
    if (!user || !user.id) return;
    startOrLoadSession(user.id, selectedRoutines);
  };

  const handleWorkoutStart = () => {
    if (!user || !user.id) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (displayRoutines.length === 0) {
      alert('먼저 오늘 수행할 루틴을 선택해주세요.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    navigate('/exercise-logs');
  };

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
    <div className="min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8" style={{ paddingTop: '72px' }}>
        
        <Card 
          className="p-6 shadow-lg bg-gradient-to-r from-[#1A1A1A] to-[#3B5998] text-white cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => navigate('/goal-recommendation')}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <img src={Favicon} alt="Favicon" className="w-10 h-10 mr-4" /> 
              <div>
                <h2 className="text-xl font-bold">AI 코치와 함께 성장하세요!</h2>
                <p className="text-sm opacity-90 mt-1">
                  나의 운동 기록을 분석해 최적의 목표를 설정해 드려요.
                </p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="mt-4 md:mt-0 text-primary hover:bg-gray-100"
            >
              목표 추천 받기 <FaArrowRight className="ml-2" />
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TodayRoutineCard
            selectedRoutines={displayRoutines}
            allUserRoutines={allUserRoutines}
            onRoutineSelect={handleRoutineSelection}
            onStart={handleWorkoutStart}
          />
          <PopularLikedExercisesCarousel />
          <PopularRoutineExercisesCarousel />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PostureScoreChart />
          <WeeklyReportCard />
        </div>
        
        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-center">커뮤니티 인기글</h2>
          <CommunityHotPosts categories={communityCategories} topPosts={communityHotPosts} />
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;