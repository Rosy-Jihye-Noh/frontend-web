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