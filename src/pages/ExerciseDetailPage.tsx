import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Exercise, Routine } from '@/types/index';
import { useUserStore } from '@/store/userStore';
// 운동 상세 정보, 사용자 좋아요 상태, 좋아요 추가/제거, 운동 좋아요 수 조회 관련 API 함수 임포트
import { fetchExerciseById, fetchUserLikes, addLikeApi, removeLikeApi, fetchExerciseLikeCount } from '@/services/api/exerciseApi';
// 사용자 루틴 목록 조회, 루틴에 운동 추가 관련 API 함수 임포트
import { fetchUserRoutines, addExerciseToRoutineApi } from '@/services/api/exerciseApi';
import Header from '@/components/common/Header';
import AddToRoutineModal from '@/components/exercise/AddToRoutineModal'; // 루틴 추가 모달 컴포넌트 임포트
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'; 
import { ArrowLeft, PlusCircle, Heart } from 'lucide-react';

// 운동 상세 정보 항목을 표시하기 위한 보조 컴포넌트
const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-center">
    {/* 항목의 레이블 (예: "운동 부위") */}
    <dt className="w-20 font-semibold text-gray-500">{label}</dt>
    {/* 항목의 값 (뱃지 형태로 표시, 값이 없으면 '정보 없음') */}
    <dd><Badge variant="outline">{value || '정보 없음'}</Badge></dd>
  </div>
);

// ExerciseDetailPage 함수형 컴포넌트 정의
const ExerciseDetailPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate(); 
  const { user } = useUserStore();

  // 컴포넌트 상태 변수들
  const [exercise, setExercise] = useState<Exercise | null>(null); // 현재 운동 상세 정보
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]); // 현재 사용자의 루틴 목록
  const [isModalOpen, setIsModalOpen] = useState(false); // '루틴에 추가' 모달의 열림/닫힘 상태
  const [isLoading, setIsLoading] = useState(true); // 데이터 로딩 중인지 여부
  const [error, setError] = useState<string | null>(null); // 오류 메시지
  const [notification, setNotification] = useState<string | null>(null); // 사용자에게 표시할 알림 메시지 (토스트 역할)
  const [isLiked, setIsLiked] = useState(false); // 현재 운동을 사용자가 '좋아요'했는지 여부
  const [likeCount, setLikeCount] = useState(0); // 현재 운동의 총 좋아요 수
  const [isLikeLoading, setIsLikeLoading] = useState(false); // 좋아요/취소 처리 중인지 여부

  // 컴포넌트 마운트 시 또는 `exerciseId`, `user` 객체가 변경될 때 데이터를 불러오는 useEffect 훅
  useEffect(() => {
    if (!exerciseId) {
      setError('유효하지 않은 접근입니다.');
      setIsLoading(false);
      return;
    }

    // 데이터를 비동기적으로 불러오는 함수 정의
    const loadData = async () => {
      try {
        // 운동 상세 정보 불러오기
        const exerciseData = await fetchExerciseById(Number(exerciseId));
        setExercise(exerciseData);
        
        // 서버에서 실제 운동의 좋아요 수를 가져옵니다.
        try {
          const likeCountData = await fetchExerciseLikeCount(Number(exerciseId));
          console.log('API 응답 전체 (좋아요 수):', likeCountData); // 디버깅용 로그
          // `likeCountData.likeCount`가 null 또는 undefined이면 0으로 기본값 설정
          const finalLikeCount = likeCountData.likeCount ?? 0; 
          setLikeCount(finalLikeCount); // 좋아요 수 상태 업데이트
          console.log('좋아요 수 설정:', finalLikeCount); // 디버깅용 로그
        } catch (likeError) {
          console.error('좋아요 수 로드 실패:', likeError);
          setLikeCount(0); // 실패 시 좋아요 수를 0으로 설정
        }
        
        // 사용자가 로그인되어 있으면 루틴 목록 및 좋아요 상태를 확인
        if (user?.id) {
          // 사용자의 루틴 목록을 가져옵니다.
          const routinesData = await fetchUserRoutines(user.id);
          setUserRoutines(routinesData);
          
          // 사용자의 좋아요 상태 확인
          const userLikes = await fetchUserLikes(user.id);
          const isCurrentExerciseLiked = userLikes.some((like: any) => like.exerciseId === Number(exerciseId));
          setIsLiked(isCurrentExerciseLiked);
        }
      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData(); // 데이터 불러오기 함수 호출
  }, [exerciseId, user]); // exerciseId 또는 user 객체가 변경될 때마다 이펙트를 다시 실행

  // notification 상태가 변경될 때마다 3초 후 notification을 null로 설정하는 useEffect
  // (토스트 메시지 자동 사라지게 함)
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000); // 3초 타이머 설정
      return () => clearTimeout(timer); // 컴포넌트 언마운트 또는 notification 변경 시 타이머 클린업
    }
  }, [notification]);

  /**
   * '루틴에 추가' 모달에서 루틴을 선택했을 때 호출되는 핸들러입니다.
   * 선택된 루틴에 현재 운동을 추가하는 API를 호출합니다.
   * @param routineId - 운동을 추가할 루틴의 ID
   */
  const handleSelectRoutine = async (routineId: number) => {
    if (!exercise) return;
    try {
      await addExerciseToRoutineApi(routineId, exercise.id); // 루틴에 운동 추가 API 호출
      setNotification(`'${exercise.name}' 운동을 루틴에 추가했습니다.`);
    } catch (error) {
      setNotification("운동 추가에 실패했습니다.");
    } finally {
      setIsModalOpen(false);
    }
  };

  /**
   * 좋아요 버튼을 토글할 때 호출되는 핸들러입니다.
   * 사용자의 좋아요 상태를 변경하고, 서버에 반영하며, 좋아요 수를 업데이트합니다.
   */
  const handleLikeToggle = async () => {
    if (!user || !exercise) return;

    setIsLikeLoading(true);
    try {
      if (isLiked) { // 현재 '좋아요' 상태이면
        await removeLikeApi(user.id, exercise.id); // 좋아요 제거 API 호출
        setIsLiked(false); // 좋아요 상태를 false로 변경 (UI 낙관적 업데이트)
        setNotification("좋아요를 취소했습니다."); // 알림 메시지 설정
      } else { // 현재 '좋아요' 상태가 아니면
        await addLikeApi(user.id, exercise.id); // 좋아요 추가 API 호출
        setIsLiked(true); // 좋아요 상태를 true로 변경 (UI 낙관적 업데이트)
        setNotification("좋아요를 추가했습니다."); // 알림 메시지 설정
      }
      
      // 좋아요 처리 후 최신 좋아요 수를 서버에서 다시 가져옵니다.
      try {
        const updatedLikeCount = await fetchExerciseLikeCount(exercise.id); // 최신 좋아요 수 API 호출
        console.log('업데이트된 API 응답 (좋아요 수):', updatedLikeCount); // 디버깅용
        const finalLikeCount = updatedLikeCount.likeCount ?? 0; // null이나 undefined면 0
        setLikeCount(finalLikeCount); // 좋아요 수 상태 업데이트
        console.log('업데이트된 좋아요 수 설정:', finalLikeCount); // 디버깅용
      } catch (countError) {
        console.error('좋아요 수 업데이트 실패:', countError); // 좋아요 수 업데이트 실패 시 에러 로깅
      }
      
    } catch (error) {
      console.error('좋아요 처리 실패:', error); // 좋아요 추가/제거 실패 시 에러 로깅
      setNotification("좋아요 처리에 실패했습니다."); // 알림 메시지 설정
    } finally {
      setIsLikeLoading(false); // 로딩 상태 종료
    }
  };

  // 로딩 중일 때 표시할 UI
  if (isLoading) return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  // 에러가 발생했을 때 표시할 UI
  if (error) return <div className="flex justify-center items-center h-screen">에러: {error}</div>;
  // 운동 정보를 찾을 수 없을 때 표시할 UI (exercise가 null인 경우)
  if (!exercise) return <div className="flex justify-center items-center h-screen">운동 정보를 찾을 수 없습니다.</div>;

  // 모든 데이터 로딩이 완료되고 운동 정보가 유효할 때 상세 페이지 UI 렌더링
  return (
    <div className="bg-background min-h-screen relative"> {/* 전체 배경 및 최소 높이 설정, 상대 위치 */}
      <Header /> {/* 상단 헤더 컴포넌트 */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8" style={{ paddingTop: 'var(--header-height, 90px)' }}> {/* 메인 콘텐츠 영역 */}
        {/* '목록으로' 돌아가기 버튼 */}
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로
        </Button>
        {/* 운동 이미지와 상세 정보를 위한 그리드 레이아웃 */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* 왼쪽: 운동 이미지 */}
          <div>
            <img 
              src={exercise.thumbnailUrl || 'https://via.placeholder.com/600x400'} // 운동 썸네일 URL, 없으면 플레이스홀더 이미지
              alt={exercise.name} // 이미지 대체 텍스트 (운동 이름)
              className="w-full rounded-lg shadow-lg object-cover" // 이미지 스타일링
            />
          </div>

          {/* 오른쪽: 상세 정보 */}
          <div className="flex flex-col space-y-6">
            <div>
              {/* 운동 카테고리 */}
              <p className="text-sm font-semibold text-blue-600">{exercise.category}</p>
              <div className="flex items-center justify-between mt-1">
                {/* 운동 이름 */}
                <h1 className="text-4xl font-bold">{exercise.name}</h1>
                {user && ( // 사용자가 로그인되어 있을 때만 좋아요 버튼 표시
                  <div className="flex items-center space-x-2">
                    {/* 좋아요 버튼 */}
                    <Button
                      variant={isLiked ? "default" : "outline"} // 좋아요 상태에 따라 버튼 스타일 변경
                      size="sm" // 작은 버튼 크기
                      onClick={handleLikeToggle} // 클릭 시 좋아요 토글 핸들러 호출
                      disabled={isLikeLoading} // 좋아요/취소 처리 중일 때 버튼 비활성화
                      className={`flex items-center space-x-1 ${
                        isLiked 
                          ? 'bg-red-500 hover:bg-red-600 text-white' // 좋아요 상태일 때 빨간색 배경
                          : 'border-red-300 text-red-500 hover:bg-red-50' // 좋아요 아닐 때 빨간색 테두리
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} /> {/* 하트 아이콘, 좋아요 시 채워짐 */}
                      <span className="min-w-[20px] text-center">
                        {isLikeLoading ? '...' : likeCount} {/* 로딩 중이거나 좋아요 수 표시 */}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {/* 운동 상세 속성 목록 */}
            <dl className="space-y-3">
              <DetailItem label="운동 부위" value={exercise.bodyPart} />
              <DetailItem label="난이도" value={exercise.difficulty} />
              <DetailItem label="자세" value={exercise.posture} />
            </dl>
            {/* 운동 설명 */}
            <div>
              <h2 className="text-lg font-semibold mb-2 text-foreground">운동 설명</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{exercise.description}</p>
            </div>
            {user && ( // 사용자가 로그인되어 있을 때만 '루틴에 추가하기' 버튼 표시
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsModalOpen(true)} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" /> 루틴에 추가하기
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* '루틴에 추가' 모달 */}
      <AddToRoutineModal
        isOpen={isModalOpen} // 모달 열림/닫힘 상태 전달
        onClose={() => setIsModalOpen(false)} // 모달 닫기 핸들러
        routines={userRoutines} // 사용자 루틴 목록 전달
        onSelectRoutine={handleSelectRoutine} // 루틴 선택 핸들러
      />

      {/* 알림 메시지 (notification 상태에 따라 표시) */}
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
    </div>
  );
};

export default ExerciseDetailPage;