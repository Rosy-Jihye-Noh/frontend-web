import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { HiHeart, HiPlus, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import type { Exercise } from '@/types/index';
import { fetchPopularExercisesByLikes, fetchPopularExercisesByRoutineAdditions } from '@/services/api/exerciseApi';

interface PopularExercisesCarouselProps {
  className?: string;
}

const ExerciseCard: React.FC<{ 
  exercise: Exercise; 
  type: 'liked' | 'routine';
  isActive: boolean;
}> = ({ exercise, type, isActive }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 ease-out transform ${
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
      } ${isHovered ? 'scale-105 shadow-lg' : 'shadow-md'} min-w-0 flex-shrink-0`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/exercises/${exercise.id}`)}
    >
      <CardContent className="p-3">
        <div className="aspect-square bg-blue-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
          {exercise.thumbnailUrl ? (
            <img 
              src={exercise.thumbnailUrl} 
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-2xl text-blue-300">💪</div>
          )}
        </div>
        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{exercise.name}</h4>
        <p className="text-xs text-gray-500 mb-2">{exercise.bodyPart}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            {type === 'liked' ? (
              <HiHeart className="w-3 h-3 text-red-500" />
            ) : (
              <HiPlus className="w-3 h-3 text-blue-500" />
            )}
          </div>
          <span className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded text-xs">
            {exercise.category || '운동'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const PopularExercisesCarousel: React.FC<PopularExercisesCarouselProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const [likedExercises, setLikedExercises] = useState<Exercise[]>([]);
  const [routineExercises, setRoutineExercises] = useState<Exercise[]>([]);
  const [currentLikedIndex, setCurrentLikedIndex] = useState(0);
  const [currentRoutineIndex, setCurrentRoutineIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPopularExercises = async () => {
      try {
        const [liked, routine] = await Promise.all([
          fetchPopularExercisesByLikes(5),
          fetchPopularExercisesByRoutineAdditions(5)
        ]);
        setLikedExercises(liked);
        setRoutineExercises(routine);
      } catch (error) {
        console.error('인기 운동 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPopularExercises();
  }, []);

  // 자동 슬라이드 기능
  useEffect(() => {
    const interval = setInterval(() => {
      if (likedExercises.length > 0) {
        setCurrentLikedIndex(prev => (prev + 1) % likedExercises.length);
      }
      if (routineExercises.length > 0) {
        setCurrentRoutineIndex(prev => (prev + 1) % routineExercises.length);
      }
    }, 3000); // 3초마다 자동 슬라이드

    return () => clearInterval(interval);
  }, [likedExercises.length, routineExercises.length]);

  const handleLikedPrev = () => {
    setCurrentLikedIndex(prev => 
      prev === 0 ? likedExercises.length - 1 : prev - 1
    );
  };

  const handleLikedNext = () => {
    setCurrentLikedIndex(prev => (prev + 1) % likedExercises.length);
  };

  const handleRoutinePrev = () => {
    setCurrentRoutineIndex(prev => 
      prev === 0 ? routineExercises.length - 1 : prev - 1
    );
  };

  const handleRoutineNext = () => {
    setCurrentRoutineIndex(prev => (prev + 1) % routineExercises.length);
  };

  if (isLoading) {
    return (
      <div className={`bg-card p-6 rounded-lg shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card p-6 rounded-lg shadow-lg ${className}`}>
      {/* 좋아요가 많은 운동 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-foreground flex items-center">
            <HiHeart className="w-5 h-5 text-red-500 mr-2" />
            인기 운동
          </h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLikedPrev}
              className="p-1 h-6 w-6"
            >
              <HiChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLikedNext}
              className="p-1 h-6 w-6"
            >
              <HiChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {likedExercises.length > 0 ? (
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentLikedIndex * 100}%)`,
                width: `${likedExercises.length * 100}%`
              }}
            >
              {likedExercises.map((exercise, index) => (
                <div key={exercise.id} className="w-full flex-shrink-0 px-1">
                  <ExerciseCard 
                    exercise={exercise} 
                    type="liked"
                    isActive={index === currentLikedIndex}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            인기 운동이 없습니다.
          </div>
        )}
        
        <Button
          onClick={() => navigate('/exercises')}
          variant="outline"
          size="sm"
          className="w-full mt-3 border-red-200 text-red-600 hover:bg-red-50"
        >
          더 많은 운동 보기
        </Button>
      </div>

      {/* 루틴에 많이 추가된 운동 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-foreground flex items-center">
            <HiPlus className="w-5 h-5 text-blue-500 mr-2" />
            루틴 인기
          </h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRoutinePrev}
              className="p-1 h-6 w-6"
            >
              <HiChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRoutineNext}
              className="p-1 h-6 w-6"
            >
              <HiChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {routineExercises.length > 0 ? (
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentRoutineIndex * 100}%)`,
                width: `${routineExercises.length * 100}%`
              }}
            >
              {routineExercises.map((exercise, index) => (
                <div key={exercise.id} className="w-full flex-shrink-0 px-1">
                  <ExerciseCard 
                    exercise={exercise} 
                    type="routine"
                    isActive={index === currentRoutineIndex}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            루틴 인기 운동이 없습니다.
          </div>
        )}
        
        <Button
          onClick={() => navigate('/routines/new')}
          size="sm"
          className="w-full mt-3 bg-blue-500 dark:bg-blue-400 text-white hover:bg-blue-600 dark:hover:bg-blue-300"
        >
          나만의 루틴 만들기
        </Button>
      </div>
    </div>
  );
};

export default PopularExercisesCarousel;
