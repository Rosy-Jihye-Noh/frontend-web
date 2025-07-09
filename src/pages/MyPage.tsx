import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';

// 타입 정의 임포트: 프로필 사용자, 루틴, 운동, 분석 기록 항목
import type { ProfileUser, Routine, Exercise, AnalysisHistoryItem } from '../types/index';

import Header from '@/components/common/Header'; // 공통 헤더 컴포넌트

// 마이페이지 서브 섹션 컴포넌트 임포트
import ProfileHeader from '../components/mypage/ProfileHeader';
import AnalysisHistorySection from '../components/mypage/AnalysisHistorySection';
import MyRoutineSection from '../components/mypage/MyRoutineSection';
import LikedExerciseSection from '../components/mypage/LikedExerciseSection';
import PostsCommentsTabsSection from '../components/mypage/PostsCommentsTabsSection';
import ExerciseRecordsSection from '../components/mypage/ExerciseRecordsSection';
import NotificationsSection from '../components/mypage/NotificationsSection';

// API 서비스 임포트: 루틴 삭제, 프로필 조회, 루틴 조회, 분석 기록 조회, 좋아요한 운동 조회
import { deleteRoutineById } from '@/services/api/routineApi'; // 루틴 삭제 API
import {
  fetchUserProfile,
  fetchUserRoutines,
  fetchUserAnalysisHistory,
  fetchFullLikedExercises
} from '@/services/api/myPageApi'; // 분리된 마이페이지 관련 API 함수들


// 탭 버튼을 위한 개별 컴포넌트
const TabButton = ({ id, activeTab, setActiveTab, children }: { id: string, activeTab: string, setActiveTab: (id: string) => void, children: React.ReactNode }) => (
    <button
        onClick={() => setActiveTab(id)} // 클릭 시 활성 탭 ID 설정
        // 활성 탭 여부에 따라 동적으로 스타일을 변경합니다.
        className={`py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
    >
        {children} {/* 탭 버튼 텍스트 */}
    </button>
);

// MyPage 함수형 컴포넌트
const MyPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
    const hasHydrated = useUserStore.persist.hasHydrated();

    // 마이페이지 데이터 상태 변수들
    const [profile, setProfile] = useState<ProfileUser | null>(null); // 사용자 프로필 정보
    const [routines, setRoutines] = useState<Routine[]>([]); // 사용자 루틴 목록
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]); // 사진 분석 기록 목록
    const [likedExercises, setLikedExercises] = useState<Exercise[]>([]); // 좋아요한 운동 목록
    
    // UI 상태 변수들
    const [isPageLoading, setIsPageLoading] = useState(true); // 페이지 로딩 중인지 여부
    const [error, setError] = useState<string | null>(null); // 에러 메시지
    const [activeTab, setActiveTab] = useState('routines'); // 현재 활성화된 탭 (기본값: 'routines')


    // 컴포넌트 마운트 시 또는 사용자 정보 로드 상태 변경 시 데이터를 불러오는 useEffect 훅
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
            setIsPageLoading(true); // 페이지 로딩 시작
            setError(null); // 이전 에러 상태 초기화
            try {
                // 분리된 API 서비스 함수들을 사용하여 여러 데이터를 병렬로 동시에 요청합니다.
                const [profileData, routinesData, historyData, likedData] = await Promise.all([
                    fetchUserProfile(userId),       // 사용자 프로필 정보
                    fetchUserRoutines(userId),      // 사용자 루틴 목록
                    fetchUserAnalysisHistory(userId), // 사용자 분석 기록
                    fetchFullLikedExercises(userId), // 사용자가 좋아요한 모든 운동
                ]);

                // 가져온 데이터로 각 상태 변수 업데이트
                setProfile(profileData);
                setRoutines(routinesData);
                setHistory(historyData);
                setLikedExercises(likedData);

            } catch (err) {
                // 오류 발생 시 에러 메시지 설정 (Error 인스턴스 여부 확인)
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
                console.error("마이페이지 데이터 로딩 실패:", err); // 상세 에러 로그
            } finally {
                setIsPageLoading(false); // 페이지 로딩 종료
            }
        };

        fetchDataForUser(user.id); // 현재 로그인된 사용자 ID로 데이터 불러오기 시작
    }, [hasHydrated, user, navigate]); // 의존성 배열: 이 값들이 변경될 때마다 이펙트 재실행

    /**
     * 루틴을 삭제하는 비동기 핸들러입니다.
     * @param routineId - 삭제할 루틴의 ID
     */
    const handleDeleteRoutine = async (routineId: number) => {
      try {
        // 루틴 삭제 API 호출
        await deleteRoutineById(routineId);
        // 상태 업데이트: 삭제된 루틴을 `routines` 목록에서 제거하여 UI를 즉시 업데이트
        setRoutines(prevRoutines => prevRoutines.filter(r => r.id !== routineId));
        alert('루틴이 삭제되었습니다. 🗑️'); // 성공 알림
      } catch (error) {
        console.error('루틴 삭제 실패:', error); // 콘솔에 에러 로깅
        alert('루틴 삭제에 실패했습니다. 다시 시도해주세요. 😭'); // 사용자에게 실패 알림
      }
    };

    // 페이지 로딩 중일 때 표시할 UI
    if (isPageLoading) {
        return (
            <div className="bg-background min-h-screen">
                <Header /> {/* 헤더 표시 */}
                <div 
                    className="flex justify-center items-center" 
                    // 헤더 높이를 고려하여 중앙 정렬을 위한 스타일
                    style={{ height: 'calc(100vh - var(--header-height, 90px))', paddingTop: 'var(--header-height, 90px)' }}
                >
                    <div className="text-center text-gray-500">
                        {/* 로딩 스피너 */}
                        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2"></div>
                        <p>마이페이지 정보를 불러오는 중... 🚀</p>
                    </div>
                </div>
            </div>
        );
    }
    
    // 에러 발생 시 표시할 UI
    if (error) {
        return <div className="flex justify-center items-center h-screen">에러: {error}</div>;
    }
    
    // 프로필 정보가 없는 경우 (로딩은 끝났지만 데이터가 없음) 표시할 UI
    if (!profile) {
        return <div className="flex justify-center items-center h-screen">사용자 정보를 찾을 수 없습니다.</div>;
    }

    // 모든 데이터 로딩이 완료되고 오류가 없는 경우 마이페이지 UI 렌더링
    return (
        <div className="bg-background min-h-screen">
            <Header /> {/* 상단 헤더 컴포넌트 */}
            <main
             className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8" // 최대 너비, 중앙 정렬, 반응형 패딩
             style={{ paddingTop: 'var(--header-height, 90px)' }} // 헤더 높이만큼 상단 패딩 추가
            >
                {/* 프로필 헤더 컴포넌트: 프로필 정보와 '수정' 버튼 클릭 핸들러 전달 */}
                <ProfileHeader user={profile} onEdit={() => navigate('/mypage/edit')} />
                
                {/* 탭 네비게이션 섹션 */}
                <div className="border-b border-border mb-6"> {/* 하단 테두리, 하단 여백 */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"> {/* 탭 버튼들의 가로 스크롤, 패딩, 스크롤바 숨김 */}
                        {/* 각 탭 버튼 컴포넌트 */}
                        <TabButton id="routines" activeTab={activeTab} setActiveTab={setActiveTab}>내 루틴 관리 🏋️‍♀️</TabButton>
                        <TabButton id="history" activeTab={activeTab} setActiveTab={setActiveTab}>사진 분석 기록 📸</TabButton>
                        <TabButton id="exercise-records" activeTab={activeTab} setActiveTab={setActiveTab}>운동 기록 📝</TabButton>
                        <TabButton id="liked" activeTab={activeTab} setActiveTab={setActiveTab}>좋아요한 운동 ❤️</TabButton>
                        <TabButton id="posts-comments" activeTab={activeTab} setActiveTab={setActiveTab}>내 글/댓글 💬</TabButton>
                        <TabButton id="notifications" activeTab={activeTab} setActiveTab={setActiveTab}>알림 🔔</TabButton>
                    </div>
                </div>

                {/* 탭 내용 섹션: activeTab 상태에 따라 해당 컴포넌트를 조건부 렌더링 */}
                <div>
                    {activeTab === 'routines' && <MyRoutineSection routines={routines} onDeleteRoutine={handleDeleteRoutine} />}
                    {activeTab === 'history' && <AnalysisHistorySection history={history} />}
                    {activeTab === 'liked' && <LikedExerciseSection likedExercises={likedExercises} />}
                    {activeTab === 'posts-comments' && <PostsCommentsTabsSection userId={user!.id} />} {/* user!.id: user가 null이 아님을 보장 */}
                    {activeTab === 'exercise-records' && <ExerciseRecordsSection />}
                    {activeTab === 'notifications' && <NotificationsSection userId={user!.id} />}
                </div>
            </main>
        </div>
    );
};

export default MyPage;