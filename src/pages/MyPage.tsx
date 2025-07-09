import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { ProfileUser, Routine, Exercise, AnalysisHistoryItem } from '../types/index';
import Header from '@/components/common/Header';
import { HiChatAlt2 } from 'react-icons/hi';
import ProfileHeader from '../components/mypage/ProfileHeader';
import AnalysisHistorySection from '../components/mypage/AnalysisHistorySection';
import MyRoutineSection from '../components/mypage/MyRoutineSection';
import LikedExerciseSection from '../components/mypage/LikedExerciseSection';
import PostsCommentsTabsSection from '../components/mypage/PostsCommentsTabsSection';
import ExerciseRecordsSection from '../components/mypage/ExerciseRecordsSection';
import NotificationsSection from '../components/mypage/NotificationsSection';
import { deleteRoutineById } from '@/services/api/routineApi';
import {
  fetchUserProfile,
  fetchUserRoutines,
  fetchUserAnalysisHistory,
  fetchFullLikedExercises
} from '@/services/api/myPageApi'; // 분리된 API 함수들을 import

const TabButton = ({ id, activeTab, setActiveTab, children }: { id: string, activeTab: string, setActiveTab: (id: string) => void, children: React.ReactNode }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
    >
        {children}
    </button>
);

const MyPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
    const hasHydrated = useUserStore.persist.hasHydrated();

    const [profile, setProfile] = useState<ProfileUser | null>(null);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
    const [likedExercises, setLikedExercises] = useState<Exercise[]>([]);
    
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('routines');

    useEffect(() => {
        if (!hasHydrated) {
            return;
        }
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        /**
         * 특정 사용자 ID에 대한 모든 마이페이지 관련 데이터를 비동기적으로 불러오는 함수입니다.
         * @param userId - 데이터를 불러올 사용자의 ID
         */
        const fetchDataForUser = async (userId: number) => {
            setIsPageLoading(true);
            setError(null);
            try {
                // 분리된 API 서비스 함수를 사용하여 데이터를 병렬로 요청합니다.
                const [profileData, routinesData, historyData, likedData] = await Promise.all([
                    fetchUserProfile(userId),
                    fetchUserRoutines(userId),
                    fetchUserAnalysisHistory(userId),
                    fetchFullLikedExercises(userId),
                ]);

                setProfile(profileData);
                setRoutines(routinesData);
                setHistory(historyData);
                setLikedExercises(likedData);

            } catch (err) {
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setIsPageLoading(false);
            }
        };

        fetchDataForUser(user.id);
    }, [hasHydrated, user, navigate]);

    /**
     * 루틴을 삭제하는 비동기 핸들러입니다.
     * @param routineId - 삭제할 루틴의 ID
     */
    const handleDeleteRoutine = async (routineId: number) => {
      try {
        await deleteRoutineById(routineId);
        // 상태 업데이트: 삭제된 루틴을 목록에서 제거
        setRoutines(prevRoutines => prevRoutines.filter(r => r.id !== routineId));
        alert('루틴이 삭제되었습니다.');
      } catch (error) {
        console.error('루틴 삭제 실패:', error);
        alert('루틴 삭제에 실패했습니다.');
      }
    };

    if (isPageLoading) {
        return (
            <div className="bg-background min-h-screen">
                <Header />
                <div 
                    className="flex justify-center items-center" 
                    style={{ height: 'calc(100vh - var(--header-height, 90px))', paddingTop: 'var(--header-height, 90px)' }}
                >
                    <div className="text-center text-gray-500">
                        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2"></div>
                        <p>마이페이지 정보를 불러오는 중...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return <div className="flex justify-center items-center h-screen">에러: {error}</div>;
    }
    
    if (!profile) {
        return <div className="flex justify-center items-center h-screen">사용자 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main
             className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8"
             style={{ paddingTop: 'var(--header-height, 90px)' }}
            >
                <ProfileHeader user={profile} onEdit={() => navigate('/mypage/edit')} />
                
                <div className="border-b border-border mb-6">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <TabButton id="routines" activeTab={activeTab} setActiveTab={setActiveTab}>내 루틴 관리</TabButton>
                        <TabButton id="history" activeTab={activeTab} setActiveTab={setActiveTab}>사진 분석 기록</TabButton>
                        <TabButton id="exercise-records" activeTab={activeTab} setActiveTab={setActiveTab}>운동 기록</TabButton>
                        <TabButton id="liked" activeTab={activeTab} setActiveTab={setActiveTab}>좋아요한 운동</TabButton>
                        <TabButton id="posts-comments" activeTab={activeTab} setActiveTab={setActiveTab}>내 글/댓글</TabButton>
                        <TabButton id="notifications" activeTab={activeTab} setActiveTab={setActiveTab}>알림</TabButton>
                    </div>
                </div>

                <div>
                    {activeTab === 'routines' && <MyRoutineSection routines={routines} onDeleteRoutine={handleDeleteRoutine} />}
                    {activeTab === 'history' && <AnalysisHistorySection history={history} />}
                    {activeTab === 'liked' && <LikedExerciseSection likedExercises={likedExercises} />}
                    {activeTab === 'posts-comments' && <PostsCommentsTabsSection userId={user!.id} />}
                    {activeTab === 'exercise-records' && <ExerciseRecordsSection />}
                    {activeTab === 'notifications' && <NotificationsSection userId={user!.id} />}
                </div>
            </main>
        </div>
    );
};

export default MyPage;