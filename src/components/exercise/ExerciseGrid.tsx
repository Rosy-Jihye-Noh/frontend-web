import React from 'react';
import { Link } from 'react-router-dom'; // react-router-dom의 Link를 사용합니다.
import type { Exercise } from '@/types/index';
import ExerciseCard from './ExerciseCard';

interface ExerciseGridProps {
  exercises: Exercise[];
  likedExerciseIds: Set<number>;
  onLikeToggle: (exerciseId: number) => void;
  onAddToRoutine: (exercise: Exercise) => void;
}

const ExerciseGrid: React.FC<ExerciseGridProps> = ({
  exercises, likedExerciseIds, onLikeToggle, onAddToRoutine,
}) => {

  // 버튼 클릭 시 링크 이동을 막는 핸들러
  const handleAddToRoutineClick = (e: React.MouseEvent, exercise: Exercise) => {
    e.preventDefault();
    onAddToRoutine(exercise);
  };
  
  const handleLikeToggleClick = (e: React.MouseEvent, exerciseId: number) => {
    e.preventDefault();
    onLikeToggle(exerciseId);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {exercises.map((exercise) => (
        <Link to={`/exercises/${exercise.id}`} key={exercise.id} className="block">
          <ExerciseCard
            exercise={exercise}
            isLiked={likedExerciseIds.has(exercise.id)}
            onLikeToggle={(e) => handleLikeToggleClick(e, exercise.id)}
            onAddToRoutine={(e) => handleAddToRoutineClick(e, exercise)}
          />
        </Link>
      ))}
    </div>
  );
};

export default ExerciseGrid;