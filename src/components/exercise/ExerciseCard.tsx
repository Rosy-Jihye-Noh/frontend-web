import React from 'react';
import type { Exercise } from '@/types/index'; // 타입 경로는 실제 프로젝트에 맞게 수정
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HiOutlineHeart, HiHeart, HiPlus } from 'react-icons/hi';
import { Link } from 'react-router-dom';

interface ExerciseCardProps {
  exercise: Exercise;
  isLiked: boolean;
  onLikeToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onAddToRoutine: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isLiked, onLikeToggle, onAddToRoutine }) => {
  return (
    <Link to={`/exercises/${exercise.id}`} className="block h-full">
      <Card className="flex flex-col h-full">
        {/* 썸네일 이미지 */}
        <div className="relative w-full h-40 bg-gray-200">
          {exercise.thumbnailUrl ? (
            <img 
              src={exercise.thumbnailUrl} 
              alt={`${exercise.name} thumbnail`}
              className="w-full h-full object-contain bg-white"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-500">
              <h3 className="text-white text-2xl font-bold px-2 text-center">{exercise.name}</h3>
            </div>
          )}
        </div>
        {/* 운동 정보 */}
        <div className="p-4 flex-grow min-h-[48px]">
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
    </Link>
  );
};

export default ExerciseCard;