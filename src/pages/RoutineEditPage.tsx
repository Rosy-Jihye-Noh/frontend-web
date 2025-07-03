import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Exercise } from '@/types/index';
import { fetchAllExercises } from '@/services/api/exerciseApi';
import { fetchRoutineById, updateRoutine } from '@/services/api/routineApi';

// 재사용할 컴포넌트들
import Header from '@/components/common/Header';
import RoutineInfoForm from '@/components/routine/RoutineInfoForm';
import AvailableExercisesList from '@/components/routine/AvailableExercisesList';
import SelectedExercisesList from '@/components/routine/SelectedExercisesList';
import { Button } from '@/components/ui/button';

const RoutineEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();

  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const handleMoveUp = (index: number) => {
    if (index === 0) return; // 맨 위 항목은 이동 불가
    const newExercises = [...selectedExercises];
    // 배열 요소 위치 교환
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    setSelectedExercises(newExercises);
    setNotification('순서가 변경되었습니다.');
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedExercises.length - 1) return; // 맨 아래 항목은 이동 불가
    const newExercises = [...selectedExercises];
    // 배열 요소 위치 교환
    [newExercises[index + 1], newExercises[index]] = [newExercises[index], newExercises[index + 1]];
    setSelectedExercises(newExercises);
    setNotification('순서가 변경되었습니다.');
  };

  useEffect(() => {
    // 기존 루틴 데이터와 전체 운동 목록을 불러옵니다.
    Promise.all([
      fetchRoutineById(Number(routineId)),
      fetchAllExercises()
    ]).then(([routineData, allExercises]) => {
      setRoutineName(routineData.name);
      setDescription(routineData.description || '');
      // 정렬된 운동 목록으로 상태 설정
      const sortedExercises = routineData.exercises.sort((a, b) => a.order - b.order);
      const exerciseDetails = sortedExercises.map(re => allExercises.find((e: Exercise) => e.id === re.exerciseId)).filter(Boolean) as Exercise[];
      setSelectedExercises(exerciseDetails);
      setAvailableExercises(allExercises);
      setIsLoading(false);
    }).catch(err => {
      console.error("데이터 로딩 실패:", err);
      alert("루틴 정보를 불러오는데 실패했습니다.");
      setIsLoading(false);
    });
  }, [routineId]);

  const filteredAvailableExercises = useMemo(() => {
    const selectedIds = new Set(selectedExercises.map(ex => ex.id));
    return availableExercises.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedIds.has(ex.id)
    );
  }, [searchTerm, availableExercises, selectedExercises]);

  const handleAddExercise = (exercise: Exercise) => {
    setSelectedExercises(prev => [...prev, exercise]);
  };

  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

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
    <div className="bg-slate-50 min-h-screen">
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