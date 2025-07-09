import React from 'react';
import { Link } from 'react-router-dom'; // react-router-dom의 Link를 사용합니다.
import type { Exercise } from '@/types/index';
import ExerciseCard from './ExerciseCard';

interface ExerciseGridProps {
  exercises: Exercise[];
  likedExerciseIds: Set<number>;
  onLikeToggle: (exerciseId: number) => void; // 운동 '좋아요' 상태를 토글할 때 호출되는 함수
  onAddToRoutine: (exercise: Exercise) => void; // 운동을 루틴에 추가할 때 호출되는 함수입니다.
}

const ExerciseGrid: React.FC<ExerciseGridProps> = ({
  exercises, likedExerciseIds, onLikeToggle, onAddToRoutine,
}) => {
  // '루틴에 추가' 버튼 클릭 시 기본 이벤트를 막고 onAddToRoutine 함수를 호출
  const handleAddToRoutineClick = (e: React.MouseEvent, exercise: Exercise) => {
    e.preventDefault();
    onAddToRoutine(exercise);
  };
  
  // '좋아요' 토글 버튼 클릭 시 기본 이벤트를 막고 onLikeToggle 함수를 호출
  const handleLikeToggleClick = (e: React.MouseEvent, exerciseId: number) => {
    e.preventDefault();
    onLikeToggle(exerciseId);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
      {/* 'exercises' 배열을 순회하며 각 운동에 대해 ExerciseCard 컴포넌트를 렌더링합니다. */}
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isLiked={likedExerciseIds.has(exercise.id)}
          onLikeToggle={(e) => handleLikeToggleClick(e, exercise.id)}
          onAddToRoutine={(e) => handleAddToRoutineClick(e, exercise)}
        />
      ))}
    </div>
  );
};

export default ExerciseGrid;