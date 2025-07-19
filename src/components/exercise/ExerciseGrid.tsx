import React from 'react';
import type { Exercise } from '@/types/index';
import ExerciseCard from './ExerciseCard'; // 이전 답변에서 개선된 ExerciseCard를 임포트합니다.
import { Frown } from 'lucide-react';

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
  // 운동 목록이 비어있는 경우 "결과 없음" UI를 렌더링합니다.
  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50 dark:bg-toss-navy/20 rounded-2xl">
        <Frown className="w-16 h-16 text-toss-gray mb-4" />
        <h3 className="text-xl font-bold text-slate-700 dark:text-white">검색 결과가 없습니다</h3>
        <p className="text-toss-gray mt-2">다른 검색어나 카테고리를 선택해보세요.</p>
      </div>
    );
  }

  return (
    // 반응형 그리드 레이아웃. 카드 간의 간격(gap)을 설정합니다.
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* 운동 배열(exercises)을 순회하며 각 운동 카드를 렌더링합니다.
        'animate-in'과 'fade-in-0' 클래스로 애니메이션을 적용하고,
        'animationDelay'를 이용해 각 카드가 순서대로 나타나도록 합니다.
      */}
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          className="animate-in fade-in-0"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <ExerciseCard
            exercise={exercise}
            isLiked={likedExerciseIds.has(exercise.id)}
            onLikeToggle={onLikeToggle} // 함수를 그대로 전달
            onAddToRoutine={onAddToRoutine} // 함수를 그대로 전달
          />
        </div>
      ))}
    </div>
  );
};

export default ExerciseGrid;