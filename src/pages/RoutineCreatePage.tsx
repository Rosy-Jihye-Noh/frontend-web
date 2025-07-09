import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { Exercise } from '@/types/index';
import { fetchAllExercises } from '@/services/api/exerciseApi';
import { createRoutine } from '@/services/api/routineApi';
import { fetchFullLikedExercises } from '@/services/api/myPageApi';

import Header from '@/components/common/Header';
import RoutinePageHeader from '@/components/routine/RoutinePageHeader';
import RoutineInfoForm from '@/components/routine/RoutineInfoForm';
import AvailableExercisesList from '@/components/routine/AvailableExercisesList';
import SelectedExercisesList from '@/components/routine/SelectedExercisesList';

const RoutineCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [likedExercises, setLikedExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 모든 운동 데이터 로드
        const exercises = await fetchAllExercises();
        setAvailableExercises(exercises);
        
        // 사용자가 좋아요한 운동 데이터 로드 (사용자가 로그인된 경우에만)
        if (user?.id) {
          const liked = await fetchFullLikedExercises(user.id);
          setLikedExercises(liked);
        }
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };

    loadData();
  }, [user]);

  // 검색어와 현재 선택된 운동을 기반으로 필터링된 '선택 가능한 운동' 목록을 계산하는 useMemo 훅
  // 이 목록은 'availableExercises'에서 'selectedExercises'에 이미 포함된 운동을 제외합니다.
  const filteredAvailableExercises = useMemo(() => {
    const selectedIds = new Set(selectedExercises.map(ex => ex.id));
    return availableExercises.filter(ex => 
      // 운동 이름이 검색어를 포함하고 (대소문자 구분 없이),
      // 아직 선택된 운동 목록에 없는 경우에만 필터링합니다.
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
   * 새로운 루틴을 저장하는 비동기 핸들러입니다.
   * 유효성 검사를 수행하고, API를 호출하여 루틴을 생성합니다.
   */
  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      alert('루틴 이름을 입력해주세요.');
      return;
    }
    if (selectedExercises.length === 0) {
      alert('하나 이상의 운동을 추가해주세요.');
      return;
    }
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setIsSaving(true);
    const routineData = {
      name: routineName,
      description: description,
      userId: user.id,
      exercises: selectedExercises.map((ex, index) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        order: index + 1,
      })),
    };

    try {
      // `createRoutine` API를 호출하여 루틴 생성
      // API 함수에 userId를 별도로 전달하는 경우, 해당 API가 userId를 경로 또는 헤더에 필요로 할 때 사용합니다.
      await createRoutine(routineData, user.id); 
      alert('새로운 루틴이 성공적으로 생성되었습니다!');
      navigate('/mypage');
    } catch (error) {
      console.error('루틴 저장 실패:', error);
      alert('루틴 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main
        className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8"
        style={{ paddingTop: 'var(--header-height, 90px)' }}
      >
        <RoutinePageHeader
          isSaving={isSaving}
          onSave={handleSaveRoutine}
          onCancel={() => navigate('/mypage')}
        />

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
            onMoveUp={(exerciseId: number) => {
              setSelectedExercises(prev => {
                const idx = prev.findIndex(ex => ex.id === exerciseId);
                if (idx > 0) {
                  const newArr = [...prev];
                  [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
                  return newArr;
                }
                return prev;
              });
            }}
            onMoveDown={(exerciseId: number) => {
              setSelectedExercises(prev => {
                const idx = prev.findIndex(ex => ex.id === exerciseId);
                if (idx !== -1 && idx < prev.length - 1) {
                  const newArr = [...prev];
                  [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
                  return newArr;
                }
                return prev;
              });
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default RoutineCreatePage;