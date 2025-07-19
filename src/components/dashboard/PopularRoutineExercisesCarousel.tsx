import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import type { Exercise } from '@/types/index';
import { fetchPopularExercisesByRoutineAdditions } from '@/services/api/exerciseApi';

const PopularRoutineExercisesCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<(Exercise & { routineCount: number })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await fetchPopularExercisesByRoutineAdditions(5);
        setExercises(data);
      } catch (error) {
        console.error('루틴 인기 운동 로딩 실패:', error);
        setExercises([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, []);

  useEffect(() => {
    if (exercises.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % exercises.length);
    }, 3000); // 3초마다 전환

    return () => clearInterval(interval);
  }, [exercises.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + exercises.length) % exercises.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % exercises.length);
  };

  if (isLoading) {
    return (
      <Card className="h-[400px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-lg font-bold text-center">루틴 인기 운동</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center flex-1">
          <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card className="h-[400px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
            <HiPlus className="w-5 h-5 text-blue-500" />
            루틴 인기 운동
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center flex-1 space-y-4">
          <p className="text-gray-500 dark:text-gray-400 text-center">아직 루틴에 많이 추가된 운동이 없습니다.</p>
          <Button
            onClick={() => navigate('/routines/new')}
            size="sm"
            className="bg-blue-500 dark:bg-blue-400 text-white hover:bg-blue-600 dark:hover:bg-blue-300"
          >
            첫 루틴 만들기
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentExercise = exercises[currentIndex];

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
          <HiPlus className="w-5 h-5 text-blue-500" />
          루틴 인기 운동
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        {currentExercise && (
          <div className="relative flex-1 flex items-center px-8">
            <div 
              className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:bg-green-100 dark:hover:bg-green-950/30 hover:scale-[1.02] w-full"
              onClick={() => navigate(`/exercises/${currentExercise.id}`)}
            >
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 relative overflow-hidden rounded-lg bg-white flex items-center justify-center shadow-sm">
                  {currentExercise.thumbnailUrl ? (
                    <img 
                      src={currentExercise.thumbnailUrl} 
                      alt={currentExercise.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-3xl">🏋️</span>';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-3xl">🏋️</span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm truncate">{currentExercise.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{currentExercise.bodyPart}</p>
                <div className="flex items-center justify-center gap-2">
                  <HiPlus className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{currentExercise.routineCount || 0}</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full ml-2">
                    {currentExercise.category}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Navigation arrows */}
            <button
              onClick={handlePrevious}
              className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50 z-10"
            >
              <HiChevronLeft className="w-3 h-3 text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50 z-10"
            >
              <HiChevronRight className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        )}

        {/* Dots indicator */}
        <div className="flex justify-center gap-1 flex-shrink-0">
          {exercises.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-green-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={() => navigate('/routines/new')}
          size="sm"
          className="w-full bg-green-500 dark:bg-green-400 text-white hover:bg-green-600 dark:hover:bg-green-300 flex-shrink-0"
        >
          나만의 루틴 만들기
        </Button>
      </CardContent>
    </Card>
  );
};

export default PopularRoutineExercisesCarousel;
