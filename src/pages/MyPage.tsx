import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { ProfileUser, Routine, Exercise, AnalysisHistoryItem, Badge } from '../types/index';
import Header from '@/components/common/Header';
import ProfileHeader from '../components/mypage/ProfileHeader';
import { deleteRoutineById } from '@/services/api/routineApi';
import {
  fetchUserProfile,
  fetchUserRoutines,
  fetchUserAnalysisHistory,
  fetchFullLikedExercises,
  fetchUserBadges,
} from '@/services/api/myPageApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components for better initial page load performance
const MyRoutineSection = lazy(() => import('../components/mypage/MyRoutineSection'));
const AnalysisHistorySection = lazy(() => import('../components/mypage/AnalysisHistorySection'));
const LikedExerciseSection = lazy(() => import('../components/mypage/LikedExerciseSection'));
const PostsCommentsTabsSection = lazy(() => import('../components/mypage/PostsCommentsTabsSection'));
const ExerciseRecordsSection = lazy(() => import('../components/mypage/ExerciseRecordsSection'));
const NotificationsSection = lazy(() => import('../components/mypage/NotificationsSection'));
const BadgeCollectionSection = lazy(() => import('@/components/mypage/BadgeCollectionSection'));
const EmotionDiarySection = lazy(() => import('@/components/mypage/EmotionDiarySection'));

const MyPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
    const hasHydrated = useUserStore.persist.hasHydrated();

    const [profile, setProfile] = useState<ProfileUser | null>(null);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
    const [likedExercises, setLikedExercises] = useState<Exercise[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!hasHydrated) return;
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        const fetchDataForUser = async (userId: number) => {
            setIsPageLoading(true);
            setError(null);
            try {
                const [profileData, routinesData, historyData, likedData, badgesData] = await Promise.all([
                    fetchUserProfile(userId),
                    fetchUserRoutines(userId),
                    fetchUserAnalysisHistory(userId),
                    fetchFullLikedExercises(userId),
                    fetchUserBadges(userId),
                ]);

                setProfile(profileData);
                setRoutines(routinesData);
                setHistory(historyData);
                setLikedExercises(likedData);
                setBadges(badgesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (err) {
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setIsPageLoading(false);
            }
        };

        fetchDataForUser(user.id);
    }, [hasHydrated, user, navigate]);

    const handleDeleteRoutine = async (routineId: number) => {
      try {
        await deleteRoutineById(routineId);
        setRoutines(prevRoutines => prevRoutines.filter(r => r.id !== routineId));
        alert('루틴이 삭제되었습니다.');
      } catch (error) {
        console.error('루틴 삭제 실패:', error);
        alert('루틴 삭제에 실패했습니다.');
      }
    };

    const renderLoadingState = () => (
      <div className="bg-background min-h-screen">
          <Header />
          <div className="flex justify-center items-center h-[calc(100vh-90px)]">
              <div className="text-center text-neutral-500">
                  <div className="animate-spin w-10 h-10 border-4 border-muted border-t-blue-500 rounded-full mx-auto mb-4"></div>
                  <p>마이페이지 정보를 불러오는 중...</p>
              </div>
          </div>
      </div>
    );
    
    if (isPageLoading) return renderLoadingState();
    if (error) return <div className="flex justify-center items-center h-screen">에러: {error}</div>;
    if (!profile) return <div className="flex justify-center items-center h-screen">사용자 정보를 찾을 수 없습니다.</div>;

    const tabList = [
      { id: 'exercise-records', label: '운동 기록' },
      { id: 'emotion-diary', label: '감정 기록' },
      { id: 'routines', label: '내 루틴' },
      { id: 'history', label: '분석 기록' },
      { id: 'posts-comments', label: '내 활동' },
      { id: 'liked', label: '좋아요' },
      { id: 'badges', label: '뱃지' },
      { id: 'notifications', label: '알림' },
    ];
    
    const contentMap: { [key: string]: React.ReactNode } = {
      'routines': <MyRoutineSection routines={routines} onDeleteRoutine={handleDeleteRoutine} />,
      'history': <AnalysisHistorySection history={history} />,
      'liked': <LikedExerciseSection likedExercises={likedExercises} />,
      'posts-comments': <PostsCommentsTabsSection userId={user!.id} />,
      'exercise-records': <ExerciseRecordsSection userProfile={profile} />,
      'emotion-diary': <EmotionDiarySection />,
      'badges': <BadgeCollectionSection badges={badges} />,
      'notifications': <NotificationsSection userId={user!.id} />,
    };

    return (
        <div className="bg-muted/30 min-h-screen">
            <Header />
            <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" style={{ paddingTop: 'calc(var(--header-height, 60px) + 1.5rem)' }}>
                <ProfileHeader user={profile} onEdit={() => navigate('/mypage/edit')} />
                
                <Tabs defaultValue="exercise-records" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 p-1 h-auto bg-muted rounded-xl">
                        {tabList.map(tab => (
                            <TabsTrigger key={tab.id} value={tab.id} className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md">
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    <div className="mt-6">
                      <Suspense fallback={<Skeleton className="w-full h-96 rounded-2xl" />}>
                        {Object.entries(contentMap).map(([tabId, content]) => (
                          <TabsContent key={tabId} value={tabId} className="bg-background rounded-2xl shadow-sm">
                            {content}
                          </TabsContent>
                        ))}
                      </Suspense>
                    </div>
                </Tabs>
            </main>
        </div>
    );
};

export default MyPage;