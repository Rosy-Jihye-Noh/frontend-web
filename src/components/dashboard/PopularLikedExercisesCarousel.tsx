import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { HiHeart, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import type { Exercise } from '@/types/index';
import { fetchPopularExercisesByLikes } from '@/services/api/exerciseApi';

const PopularLikedExercisesCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<(Exercise & { likeCount: number })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await fetchPopularExercisesByLikes(5);
        setExercises(data);
      } catch (error) {
        console.error('인기 운동 로딩 실패:', error);
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
          <CardTitle className="text-lg font-bold text-center">좋아요 인기 운동</CardTitle>
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
            <HiHeart className="w-5 h-5 text-red-500" />
            좋아요 인기 운동
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center flex-1 space-y-4">
          <p className="text-gray-500 dark:text-gray-400 text-center">아직 좋아요가 많은 운동이 없습니다.</p>
          <Button
            onClick={() => navigate('/exercises')}
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            운동 둘러보기
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
          <HiHeart className="w-5 h-5 text-red-500" />
          좋아요 인기 운동
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        {currentExercise && (
          <div className="relative flex-1 flex items-center px-8">
            <div 
              className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:scale-[1.02] w-full"
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
                          parent.innerHTML = '<span class="text-3xl">💪</span>';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-3xl">💪</span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm truncate">{currentExercise.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{currentExercise.bodyPart}</p>
                <div className="flex items-center justify-center gap-2">
                  <HiHeart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{currentExercise.likeCount || 0}</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full ml-2">
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
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={() => navigate('/exercises')}
          variant="outline"
          size="sm"
          className="w-full border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex-shrink-0"
        >
          더 많은 운동 보기
        </Button>
      </CardContent>
    </Card>
  );
};

export default PopularLikedExercisesCarousel;
