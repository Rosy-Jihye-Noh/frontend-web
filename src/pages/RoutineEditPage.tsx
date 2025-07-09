import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Exercise } from '@/types/index';
import { fetchAllExercises } from '@/services/api/exerciseApi';
import { fetchRoutineById, updateRoutine } from '@/services/api/routineApi';
import { fetchFullLikedExercises } from '@/services/api/myPageApi';
import { useUserStore } from '@/store/userStore';

// 재사용할 컴포넌트들
import Header from '@/components/common/Header';
import RoutineInfoForm from '@/components/routine/RoutineInfoForm';
import AvailableExercisesList from '@/components/routine/AvailableExercisesList';
import SelectedExercisesList from '@/components/routine/SelectedExercisesList';
import { Button } from '@/components/ui/button';

const RoutineEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();
  const { user } = useUserStore();

  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [likedExercises, setLikedExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * '선택된 운동' 목록에서 특정 운동의 순서를 위로 옮기는 핸들러입니다.
   * @param index - 이동할 운동의 현재 인덱스
   */
  const handleMoveUp = (index: number) => {
    if (index === 0) return; // 맨 위 항목은 이동 불가
    const newExercises = [...selectedExercises];
    // 배열 요소 위치 교환
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    setSelectedExercises(newExercises);
  };

  /**
   * '선택된 운동' 목록에서 특정 운동의 순서를 아래로 옮기는 핸들러입니다.
   * @param index - 이동할 운동의 현재 인덱스
   */
  const handleMoveDown = (index: number) => {
    if (index === selectedExercises.length - 1) return; // 맨 아래 항목은 이동 불가
    const newExercises = [...selectedExercises];
    // 배열 요소 위치 교환
    [newExercises[index + 1], newExercises[index]] = [newExercises[index], newExercises[index + 1]];
    setSelectedExercises(newExercises);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // 기존 루틴 데이터와 전체 운동 목록을 불러옵니다.
        const [routineData, allExercises] = await Promise.all([
          fetchRoutineById(Number(routineId)),
          fetchAllExercises()
        ]);
        
        setRoutineName(routineData.name);
        setDescription(routineData.description || '');
        // 루틴에 포함된 운동들을 순서(order)에 따라 정렬하고, 각 운동의 상세 정보를 매핑합니다.
        // `find`가 실패할 수 있으므로 `filter(Boolean)`으로 유효한 운동만 남깁니다.
        const sortedExercises = routineData.exercises.sort((a, b) => a.order - b.order);
        const exerciseDetails = sortedExercises.map(re => allExercises.find((e: Exercise) => e.id === re.exerciseId)).filter(Boolean) as Exercise[];
        setSelectedExercises(exerciseDetails);
        setAvailableExercises(allExercises);
        
        // 사용자가 좋아요한 운동 데이터 로드 (사용자가 로그인된 경우에만)
        if (user?.id) {
          const liked = await fetchFullLikedExercises(user.id);
          setLikedExercises(liked);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        alert("루틴 정보를 불러오는데 실패했습니다.");
        setIsLoading(false);
      }
    };

    loadData();
  }, [routineId, user]);

  const filteredAvailableExercises = useMemo(() => {
    const selectedIds = new Set(selectedExercises.map(ex => ex.id));
    return availableExercises.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedIds.has(ex.id)
    );
  }, [searchTerm, availableExercises, selectedExercises]);

  /**
   * 운동을 '선택된 운동' 목록에 추가하는 핸들러입니다.
   * @param exercise - 추가할 운동 객체
   */
  const handleAddExercise = (exercise: Exercise) => {
    setSelectedExercises(prev => [...prev, exercise]);
  };

  /**
   * 운동을 '선택된 운동' 목록에서 제거하는 핸들러입니다.
   * @param exerciseId - 제거할 운동의 ID
   */
  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  /**
   * 루틴 변경사항을 저장하는 비동기 핸들러입니다.
   * 유효성 검사를 수행하고, API를 호출하여 루틴을 업데이트합니다.
   */
  const handleUpdateRoutine = async () => {
    if (!routineId) return;

    setIsSaving(true);
    const routineData = {
      name: routineName,
      description: description,
      exercises: selectedExercises.map((ex, index) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        order: index + 1,
      })),
    };

    try {
      await updateRoutine(Number(routineId), routineData);
      alert('루틴이 성공적으로 수정되었습니다!');
      navigate(`/routines/${routineId}`);
    } catch (error) {
      console.error('루틴 수정 실패:', error);
      alert('루틴 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">루틴 정보를 불러오는 중...</div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main
        className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8"
        style={{ paddingTop: 'var(--header-height, 90px)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">루틴 편집</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>취소</Button>
            <Button onClick={handleUpdateRoutine} disabled={isSaving}>
              {isSaving ? '저장 중...' : '변경사항 저장'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <RoutineInfoForm
              routineName={routineName}
              description={description}
              onNameChange={setRoutineName}
              onDescriptionChange={setDescription}
            />
            <AvailableExercisesList
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              exercises={filteredAvailableExercises}
              likedExercises={likedExercises}
              onAddExercise={handleAddExercise}
            />
          </div>
          <SelectedExercisesList
            exercises={selectedExercises}
            onRemoveExercise={handleRemoveExercise}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        </div>
      </main>
    </div>
  );
};

export default RoutineEditPage;