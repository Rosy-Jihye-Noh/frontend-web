import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { ProfileUser, Routine, Exercise, AnalysisHistory } from '../types/index';
import Header from '@/components/common/Header';
import { HiChatAlt2 } from 'react-icons/hi';
import ProfileHeader from '../components/mypage/ProfileHeader';
import AnalysisHistorySection from '../components/mypage/AnalysisHistorySection';
import MyRoutineSection from '../components/mypage/MyRoutineSection';
import LikedExerciseSection from '../components/mypage/LikedExerciseSection';

const TabButton = ({ id, activeTab, setActiveTab, children }: { id: string, activeTab: string, setActiveTab: (id: string) => void, children: React.ReactNode }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
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
    const [history, setHistory] = useState<AnalysisHistory[]>([]);
    const [likedExercises, setLikedExercises] = useState<Exercise[]>([]);
    
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('routines');

    useEffect(() => {
        // 1. 데이터 로딩 중에는 아무것도 하지 않고 대기
        if (!hasHydrated) {
            return;
        }
        // 2. 로딩 완료 후, 로그인 상태가 아니라면 로그인 페이지로 이동
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        const fetchDataForUser = async (userId: number) => {
            setIsPageLoading(true);
            try {
                const [profileRes, routinesRes, historyRes, likedRes] = await Promise.all([
                    fetch(`http://localhost:8081/api/users/${userId}`),
                    fetch(`http://localhost:8081/api/routines/user/${userId}`),
                    fetch(`http://localhost:8081/api/analysis-histories/user/${userId}`),
                    fetch(`http://localhost:8081/api/exercise-likes/user/${userId}`)
                ]);

                if (!profileRes.ok || !routinesRes.ok || !historyRes.ok || !likedRes.ok) {
                    throw new Error('마이페이지 데이터를 불러오는 데 실패했습니다.');
                }

                const profileData: ProfileUser = await profileRes.json();
                const routinesData: Routine[] = await routinesRes.json();
                const historyData: AnalysisHistory[] = await historyRes.json();
                const likedData = await likedRes.json();

                const likedExercisesDetails = await Promise.all(
                    likedData.map((like: { exerciseId: number }) =>
                        fetch(`http://localhost:8081/api/exercises/${like.exerciseId}`).then(res => res.json())
                    )
                );

                setProfile(profileData);
                setRoutines(routinesData);
                setHistory(historyData);
                setLikedExercises(likedExercisesDetails.map(ex => ({ ...ex, liked: true })));
            } catch (err) {
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setIsPageLoading(false);
            }
        };

        fetchDataForUser(user.id);
    }, [hasHydrated, user, navigate]);

    // 데이터 로딩 중에는 로딩 화면 표시
    if (!hasHydrated) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }
    if (error) {
        return <div className="flex justify-center items-center h-screen">에러: {error}</div>;
    }
    // 로딩이 끝났는데도 프로필 정보가 없다면 에러 메시지 표시
    if (!profile) {
        return <div className="flex justify-center items-center h-screen">사용자 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header />
            <main
             className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8"
             style={{ paddingTop: 'var(--header-height, 90px)' }}
            >
                <ProfileHeader user={profile} onEdit={() => navigate('/mypage/edit')} />
                
                <div className="border-b border-slate-200 mb-6">
                    <div className="flex space-x-8">
                        <TabButton id="routines" activeTab={activeTab} setActiveTab={setActiveTab}>내 루틴 관리</TabButton>
                        <TabButton id="history" activeTab={activeTab} setActiveTab={setActiveTab}>사진 분석 기록</TabButton>
                        <TabButton id="liked" activeTab={activeTab} setActiveTab={setActiveTab}>좋아요한 운동</TabButton>
                    </div>
                </div>

                <div>
                    {activeTab === 'routines' && <MyRoutineSection routines={routines} onAddRoutine={() => console.log("새 루틴 추가하기")} />}
                    {activeTab === 'history' && <AnalysisHistorySection history={history} />}
                    {activeTab === 'liked' && <LikedExerciseSection likedExercises={likedExercises} />}
                </div>
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

export default MyPage;