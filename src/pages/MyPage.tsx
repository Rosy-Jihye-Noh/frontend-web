import React, { useState, useEffect } from 'react';
import type { User, Routine, Exercise, AnalysisHistory } from '../types/index'; // 타입 정의 임포트
import Header from '@/components/common/Header';
import { HiChatAlt2 } from 'react-icons/hi';

// 분리된 섹션 컴포넌트 임포트
import ProfileHeader from '../components/mypage/ProfileHeader';
import AnalysisHistorySection from '../components/mypage/AnalysisHistorySection';
import MyRoutineSection from '../components/mypage/MyRoutineSection';
import LikedExerciseSection from '../components/mypage/LikedExerciseSection';

// --- 컴포넌트 ---

const TabButton = ({ id, activeTab, setActiveTab, children }: { id: string, activeTab: string, setActiveTab: (id: string) => void, children: React.ReactNode }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
    >
        {children}
    </button>
);

const MyPage: React.FC = () => {
    // 💡 실제 애플리케이션에서는 로그인 상태에서 사용자 ID를 가져옵니다.
    const MOCK_USER_ID = 89;

    // API로부터 받아온 데이터를 관리하는 state
    const [user, setUser] = useState<User | null>(null);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [history, setHistory] = useState<AnalysisHistory[]>([]);
    const [likedExercises, setLikedExercises] = useState<Exercise[]>([]);
    
    // 로딩 및 에러 상태 관리
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState('routines');

    // 컴포넌트가 마운트될 때 사용자 데이터를 가져오는 useEffect
    useEffect(() => {
        const fetchDataForUser = async (userId: number) => {
            setIsLoading(true);
            setError(null);
            try {
                // 여러 API 요청을 동시에 처리하여 로딩 속도 향상
                const [userRes, routinesRes, historyRes, likedRes] = await Promise.all([
                    fetch(`http://localhost:8081/api/users/${userId}`), // UserController
                    fetch(`http://localhost:8081/api/routines/user/${userId}`), // RoutineController
                    fetch(`http://localhost:8081/api/analysis-histories/user/${userId}`), // AnalysisHistoryController
                    fetch(`http://localhost:8081/api/exercise-likes/user/${userId}`) // ExerciseLikeController
                ]);

                if (!userRes.ok || !routinesRes.ok || !historyRes.ok || !likedRes.ok) {
                    throw new Error('마이페이지 데이터를 불러오는 데 실패했습니다.');
                }

                // 각 응답을 JSON으로 변환
                const userData: User = await userRes.json();
                const routinesData: Routine[] = await routinesRes.json();
                const historyData: AnalysisHistory[] = await historyRes.json();
                const likedData = await likedRes.json(); // 좋아요한 운동 정보 (ExerciseLikeDTO)

                // 좋아요한 운동의 상세 정보를 가져오기 (ExerciseController)
                const likedExercisesDetails = await Promise.all(
                    likedData.map((like: { exerciseId: number }) =>
                        fetch(`/api/exercises/${like.exerciseId}`).then(res => res.json())
                    )
                );

                // State 업데이트
                setUser(userData);
                setRoutines(routinesData);
                setHistory(historyData);
                setLikedExercises(likedExercisesDetails.map(ex => ({ ...ex, liked: true })));

            } catch (err) {
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForUser(MOCK_USER_ID);
    }, [MOCK_USER_ID]); // userId가 변경될 경우 데이터를 다시 가져옵니다.


    // --- 로딩 및 에러 UI ---
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen">에러: {error}</div>;
    }

    if (!user) {
        return <div className="flex justify-center items-center h-screen">사용자 정보를 찾을 수 없습니다.</div>;
    }


    // --- 메인 UI ---
    return (
        <div className="bg-slate-50 min-h-screen">
            <Header />
            <main
             className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8"
             style={{ paddingTop: 'var(--header-height, 100px)' }}
            >
                <ProfileHeader user={user} onEdit={() => console.log("프로필 수정")} />

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