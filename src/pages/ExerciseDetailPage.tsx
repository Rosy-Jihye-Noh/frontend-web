import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Exercise, Routine } from '@/types/index';
import { useUserStore } from '@/store/userStore';
import { fetchExerciseById, fetchUserLikes, addLikeApi, removeLikeApi, fetchExerciseLikeCount } from '@/services/api/exerciseApi';
import { fetchUserRoutines, addExerciseToRoutineApi } from '@/services/api/exerciseApi';
import Header from '@/components/common/Header';
import AddToRoutineModal from '@/components/exercise/AddToRoutineModal';
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Heart } from 'lucide-react';

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-center">
    <dt className="w-20 font-semibold text-gray-500">{label}</dt>
    <dd><Badge variant="outline">{value || '정보 없음'}</Badge></dd>
  </div>
);

const ExerciseDetailPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  useEffect(() => {
    if (!exerciseId) {
      setError('유효하지 않은 접근입니다.');
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const exerciseData = await fetchExerciseById(Number(exerciseId));
        setExercise(exerciseData);
        
        // 서버에서 실제 좋아요 수 가져오기
        try {
          const likeCountData = await fetchExerciseLikeCount(Number(exerciseId));
          console.log('API 응답 전체:', likeCountData);
          const finalLikeCount = likeCountData.likeCount ?? 0; // null이나 undefined면 0
          setLikeCount(finalLikeCount);
          console.log('좋아요 수 설정:', finalLikeCount);
        } catch (likeError) {
          console.error('좋아요 수 로드 실패:', likeError);
          setLikeCount(0);
        }
        
        if (user?.id) {
          // ✨ 2. 올바른 함수(fetchUserRoutines)를 호출하여 사용자의 루틴 목록을 가져옵니다.
          const routinesData = await fetchUserRoutines(user.id);
          // ✨ 3. 가져온 루틴 목록을 상태에 올바르게 설정합니다.
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
    loadData();
  }, [exerciseId, user]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
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
      await addExerciseToRoutineApi(routineId, exercise.id);
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
      if (isLiked) {
        await removeLikeApi(user.id, exercise.id);
        setIsLiked(false);
        setNotification("좋아요를 취소했습니다.");
      } else {
        await addLikeApi(user.id, exercise.id);
        setIsLiked(true);
        setNotification("좋아요를 추가했습니다.");
      }
      
      // 좋아요 처리 후 최신 좋아요 수를 서버에서 다시 가져오기
      try {
        const updatedLikeCount = await fetchExerciseLikeCount(exercise.id);
        console.log('업데이트된 API 응답:', updatedLikeCount);
        const finalLikeCount = updatedLikeCount.likeCount ?? 0; // null이나 undefined면 0
        setLikeCount(finalLikeCount);
        console.log('업데이트된 좋아요 수 설정:', finalLikeCount);
      } catch (countError) {
        console.error('좋아요 수 업데이트 실패:', countError);
      }
      
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      setNotification("좋아요 처리에 실패했습니다.");
    } finally {
      setIsLikeLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  if (error) return <div className="flex justify-center items-center h-screen">에러: {error}</div>;
  if (!exercise) return <div className="flex justify-center items-center h-screen">운동 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="bg-background min-h-screen relative">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8" style={{ paddingTop: 'var(--header-height, 90px)' }}>
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로
        </Button>
        <div className="grid md:grid-cols-2 gap-8">
          {/* 왼쪽: 이미지 */}
          <div>
            <img 
              src={exercise.thumbnailUrl || 'https://via.placeholder.com/600x400'} 
              alt={exercise.name} 
              className="w-full rounded-lg shadow-lg object-cover"
            />
          </div>

          {/* 오른쪽: 상세 정보 */}
          <div className="flex flex-col space-y-6">
            <div>
              <p className="text-sm font-semibold text-blue-600">{exercise.category}</p>
              <div className="flex items-center justify-between mt-1">
                <h1 className="text-4xl font-bold">{exercise.name}</h1>
                {user && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={handleLikeToggle}
                      disabled={isLikeLoading}
                      className={`flex items-center space-x-1 ${
                        isLiked 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'border-red-300 text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="min-w-[20px] text-center">
                        {isLikeLoading ? '...' : likeCount}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <dl className="space-y-3">
              <DetailItem label="운동 부위" value={exercise.bodyPart} />
              <DetailItem label="난이도" value={exercise.difficulty} />
              <DetailItem label="자세" value={exercise.posture} />
            </dl>
            <div>
              <h2 className="text-lg font-semibold mb-2 text-foreground">운동 설명</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{exercise.description}</p>
            </div>
            {user && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsModalOpen(true)} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" /> 루틴에 추가하기
              </Button>
            )}
          </div>
        </div>
      </main>

      <AddToRoutineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        routines={userRoutines}
        onSelectRoutine={handleSelectRoutine}
      />

      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
    </div>
  );
};

export default ExerciseDetailPage;