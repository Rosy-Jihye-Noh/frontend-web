import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiChevronLeft, HiChevronRight, HiArrowRight } from 'react-icons/hi';
import type { Exercise } from '@/types/index';
import { fetchPopularExercisesByRoutineAdditions } from '@/services/api/exerciseApi';

const PopularRoutineExercisesCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<(Exercise & { routineCount: number })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);
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
    if (exercises.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % exercises.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [exercises.length]);

  const handlePrevious = () => setCurrentIndex((prev) => (prev - 1 + exercises.length) % exercises.length);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % exercises.length);

  if (isLoading) {
    return (
      <Card className="min-h-[400px] flex items-center justify-center p-6 shadow-md rounded-2xl">
        <div className="animate-spin w-8 h-8 border-2 border-muted border-t-[#007AFF] rounded-full" />
      </Card>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-6 shadow-md rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <HiPlus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">루틴 인기 운동이 없습니다</h3>
        <p className="text-muted-foreground mb-4">루틴을 만들어 인기 운동을 확인해보세요.</p>
        <Button onClick={() => navigate('/routines/new')} className="bg-[#007AFF] hover:bg-[#0056b3] text-white">
          새 루틴 만들기
        </Button>
      </Card>
    );
  }

  const currentExercise = exercises[currentIndex];

  return (
    <Card className="w-[300px] h-[400px] flex flex-col p-4 shadow-md rounded-xl">
      <CardHeader className="p-0 mb-3 flex-shrink-0">
        <CardTitle className="text-base font-bold text-center flex items-center justify-center gap-1.5">
          <HiPlus className="w-5 h-5 text-[#007AFF]" />
          루틴 인기 운동
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow p-0 relative flex flex-col items-center justify-between">
        {currentExercise && (
          <div
            className="w-full flex flex-col items-center justify-center text-center p-3 cursor-pointer"
            onClick={() => navigate(`/exercises/${currentExercise.id}`)}
          >
            <div className="w-40 h-40 bg-muted rounded-full mb-3 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
              {currentExercise.thumbnailUrl ? (
                <img 
                  src={currentExercise.thumbnailUrl} 
                  alt={currentExercise.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
            <h6 className="font-bold text-base text-foreground truncate max-w-full">{currentExercise.name}</h6>
            <p className="text-xs text-muted-foreground">{currentExercise.bodyPart}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="secondary" className="text-xs">
                <HiPlus className="w-3.5 h-3.5 text-[#007AFF] mr-1" /> {currentExercise.routineCount || 0}
              </Badge>
              <Badge variant="outline" className="text-xs">{currentExercise.category}</Badge>
            </div>
          </div>
        )}
        {exercises.length > 1 && (
          <>
            <Button onClick={handlePrevious} size="icon" variant="ghost" className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full h-8 w-8">
              <HiChevronLeft className="w-5 h-5" />
            </Button>
            <Button onClick={handleNext} size="icon" variant="ghost" className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full h-8 w-8">
              <HiChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}
      </CardContent>

      <div className="flex justify-center gap-1.5 my-3 flex-shrink-0">
        {exercises.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentIndex ? 'bg-[#007AFF]' : 'bg-muted'}`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </Card>
  );
};

export default PopularRoutineExercisesCarousel;