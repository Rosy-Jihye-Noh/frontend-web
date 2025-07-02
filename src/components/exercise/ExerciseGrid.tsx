import React from 'react';
import type { Exercise } from '@/types/index';
import ExerciseCard from './ExerciseCard';

interface ExerciseGridProps {
  exercises: Exercise[];
  likedExerciseIds: Set<number>;
  onLikeToggle: (exerciseId: number) => void;
  onAddToRoutine: (exercise: Exercise) => void;
}

const ExerciseGrid: React.FC<ExerciseGridProps> = ({
  exercises,
  likedExerciseIds,
  onLikeToggle,
  onAddToRoutine,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={{ ...exercise, bodyPart: exercise.bodyPart || '' }}
          isLiked={likedExerciseIds.has(exercise.id)}
          onLikeToggle={() => onLikeToggle(exercise.id)}
          onAddToRoutine={() => onAddToRoutine(exercise)}
        />
      ))}
    </div>
  );
};

export default ExerciseGrid;