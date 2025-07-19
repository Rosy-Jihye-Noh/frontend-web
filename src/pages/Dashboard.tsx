import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HiCamera, HiUser, HiChatAlt2, HiLightBulb, HiCheckCircle } from 'react-icons/hi';
import { FaBrain, FaArrowRight } from 'react-icons/fa';
import { useUserStore } from '@/store/userStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useLogStore } from '@/store/logStore';
import CommunityHotPosts from '@/components/dashboard/CommunityHotPosts';
import TodayRoutineCard from '@/components/dashboard/TodayRoutineCard';
import PostureScoreCard from '@/components/dashboard/PostureScoreCard';
import WeeklyReportCard from '@/components/dashboard/WeeklyReportCard';
import PopularLikedExercisesCarousel from '@/components/dashboard/PopularLikedExercisesCarousel';
import PopularRoutineExercisesCarousel from '@/components/dashboard/PopularRoutineExercisesCarousel';
import { fetchCategories, fetchPopularPostsByCategory } from '@/services/api/communityApi';
import { getRoutinesByUser } from '@/services/api/routineApi';
import type { Routine } from '@/types/index';

const Dashboard: React.FC = () => {
  const { user } = useUserStore();
  const {
    todaySelectedRoutines,
    setTodaySelectedRoutines,
    setCurrentUser,
    getTodayRoutines,
    clearUserData,
  } = useDashboardStore();
  const { startOrLoadSession, setSelectedDate } = useLogStore();
  const navigate = useNavigate();

  // 상태
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [communityHotPosts, setCommunityHotPosts] = useState<any[]>([]);
  const [completedRoutineIds, setCompletedRoutineIds] = useState<number[]>([]);

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
    getRoutinesByUser(user.id)
      .then(userRoutines => {
        // API 함수에서 이미 사용자 검증을 수행하므로 추가 검증 불필요
        console.log('사용자 루틴 로드 성공:', userRoutines.length, '개의 루틴');
        setRoutines(userRoutines);
      })
      .catch(error => {
        console.error('사용자 루틴 로드 실패:', error);
        // 인증 오류인 경우 로그인 페이지로 이동
        if ((error as any).response?.status === 401 || (error as any).response?.status === 403) {
          console.log('인증 오류로 인한 로그인 페이지 이동');
          clearUserData();
          navigate('/login');
        }
        setRoutines([]);
      });

    // 2. 카테고리 불러오기 및 각 카테고리별 인기글 불러오기
    fetchCategories()
      .then(async categories => {
        setCategories(categories);
        // 각 카테고리별 인기글 1개씩
        const hotPosts = await Promise.all(
          categories.map(async (cat: any) => {
            try {
              const postRes = await fetchPopularPostsByCategory(cat.id, 0, 1);
              const post = postRes.content?.[0];
              return post
                ? { category: cat.name, title: post.title, likes: post.likeCount, id: post.id }
                : { category: cat.name, title: '', likes: 0, id: null };
            } catch {
              return { category: cat.name, title: '', likes: 0, id: null };
            }
          })
        );
        setCommunityHotPosts(hotPosts);
      })
      .catch(console.error);

  }, [user, navigate, clearUserData, getTodayRoutines, setCurrentUser]);

  // 오늘 날짜가 바뀔 때 완료된 루틴 초기화
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('lastRoutineDate');
    
    if (savedDate !== today) {
      setCompletedRoutineIds([]);
      localStorage.setItem('lastRoutineDate', today);
      console.log('새로운 날짜로 루틴 완료 상태 초기화');
    } else {
      // 같은 날짜면 저장된 완료 상태 복원
      const savedCompleted = localStorage.getItem('completedRoutineIds');
      if (savedCompleted) {
        try {
          setCompletedRoutineIds(JSON.parse(savedCompleted));
        } catch (error) {
          console.error('완료된 루틴 데이터 복원 실패:', error);
        }
      }
    }
  }, []);

  // 완료된 루틴 상태를 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('completedRoutineIds', JSON.stringify(completedRoutineIds));
  }, [completedRoutineIds]);

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
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8" style={{ paddingTop: '72px' }}>
        
        <Card 
          className="p-6 shadow-lg bg-gradient-to-r from-primary to-blue-500 text-white cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => navigate('/goal-recommendation')}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <FaBrain className="w-10 h-10 mr-4" />
              <div>
                <h2 className="text-xl font-bold">AI 코치와 함께 성장하세요!</h2>
                <p className="text-sm opacity-90 mt-1">
                  나의 운동 기록을 분석해 최적의 목표를 설정해 드려요.
                </p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="mt-4 md:mt-0 bg-white text-primary hover:bg-gray-100"
            >
              목표 추천 받기 <FaArrowRight className="ml-2" />
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TodayRoutineCard
            selectedRoutines={todaySelectedRoutines}
            allUserRoutines={routines}
            onRoutineSelect={handleRoutineSelection}
            onStart={handleWorkoutStart}
          />
          <PopularLikedExercisesCarousel />
          <PopularRoutineExercisesCarousel />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PostureScoreCard />
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