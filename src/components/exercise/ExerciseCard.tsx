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
    <Link to={`/exercises/${exercise.id}`} className="block h-full group">
      <Card className="flex flex-col h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 bg-white dark:bg-gray-800 rounded-xl">
        {/* 썸네일 이미지 */}
        <div className="relative w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30">
          {exercise.thumbnailUrl ? (
            <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-t-xl overflow-hidden">
              <img 
                src={exercise.thumbnailUrl} 
                alt={`${exercise.name} thumbnail`}
                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-t-xl">
              <h3 className="text-white text-xl font-bold px-4 text-center drop-shadow-lg">{exercise.name}</h3>
            </div>
          )}
          {/* 카테고리 배지 */}
          <div className="absolute top-3 left-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 dark:bg-blue-900/70 dark:text-blue-200 rounded-full backdrop-blur-sm">
              {exercise.bodyPart}
            </span>
          </div>
        </div>
        {/* 운동 정보 */}
        <div className="p-5 flex-grow">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {exercise.name}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">
              {exercise.posture}
            </span>
          </div>
        </div>
        {/* 버튼 영역 */}
        <div className="px-5 pb-5 flex justify-between items-center">
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>상세보기</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={onLikeToggle} 
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 group/like"
            >
              {isLiked ? (
                <HiHeart className="w-5 h-5 text-red-500 group-hover/like:scale-110 transition-transform duration-200" />
              ) : (
                <HiOutlineHeart className="w-5 h-5 text-gray-400 hover:text-red-500 group-hover/like:scale-110 transition-all duration-200" />
              )}
            </button>
            <Button 
              onClick={onAddToRoutine} 
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <HiPlus className="w-4 h-4 mr-1" />
              추가
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ExerciseCard;