import React from 'react';
import type { Exercise } from '@/types/index'; // 타입 경로는 실제 프로젝트에 맞게 수정
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HiOutlineHeart, HiHeart, HiPlus } from 'react-icons/hi';

interface ExerciseCardProps {
  exercise: Exercise;
  isLiked: boolean;
  onLikeToggle: () => void;
  onAddToRoutine: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isLiked, onLikeToggle, onAddToRoutine }) => {
  return (
    <Card className="flex flex-col">
      {/* 썸네일 이미지 */}
      <div className="w-full h-32 bg-blue-500 flex items-center justify-center rounded-t-lg">
        <h3 className="text-white text-3xl font-bold">{exercise.name}</h3>
      </div>
      {/* 운동 정보 */}
      <div className="p-4 flex-grow">
        <p className="font-bold text-lg">{exercise.name}</p>
        <p className="text-sm text-gray-500">{exercise.bodyPart} / {exercise.posture}</p>
      </div>
      {/* 버튼 영역 */}
      <div className="p-4 border-t flex justify-end items-center space-x-2">
        <button onClick={onLikeToggle} className="text-gray-400 hover:text-red-500">
          {isLiked ? (
            <HiHeart className="w-6 h-6 text-red-500" />
          ) : (
            <HiOutlineHeart className="w-6 h-6" />
          )}
        </button>
        <Button onClick={onAddToRoutine} size="icon" variant="outline" className="rounded-full w-8 h-8">
          <HiPlus className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
};

export default ExerciseCard;