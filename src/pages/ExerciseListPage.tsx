import React, { useState, useEffect, useMemo } from 'react';
import type { Exercise, Routine } from '@/types/index';
import { useUserStore } from '@/store/userStore';
import Header from '@/components/common/Header';
import ExerciseFilter from '@/components/exercise/ExerciseFilter';
import ExerciseGrid from '@/components/exercise/ExerciseGrid';
import AddToRoutineModal from '@/components/exercise/AddToRoutineModal';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { 
  fetchAllExercises, 
  fetchUserLikes, 
  fetchUserRoutines, 
  addLikeApi, 
  removeLikeApi, 
  addExerciseToRoutineApi 
} from '@/services/api/exerciseApi';

const CATEGORIES = ["전체", "전신", "다리", "옆구리", "허리", "허벅지", "엉덩이", "종아리", "팔", "가슴", "등", "어깨", "복부"] as const;
const EXERCISES_PER_PAGE = 12; 
const MAX_VISIBLE_PAGES = 8;

const ExerciseListPage: React.FC = () => {
  const { user } = useUserStore();
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [likedExerciseIds, setLikedExerciseIds] = useState<Set<number>>(new Set());
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('전체');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exercisePage, setExercisePage] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [exercisesData, likesData, routinesData] = await Promise.all([
          fetchAllExercises(),
          fetchUserLikes(user.id),
          fetchUserRoutines(user.id)
        ]);
        setAllExercises(exercisesData);
        setLikedExerciseIds(new Set(likesData.map((like: { exerciseId: number }) => like.exerciseId)));
        setUserRoutines(routinesData);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [user]);

  const handleLikeToggle = async (exerciseId: number) => {
    if (!user?.id) return;
    const isLiked = likedExerciseIds.has(exerciseId);
    try {
      const api = isLiked ? removeLikeApi : addLikeApi;
      await api(user.id, exerciseId);
      setLikedExerciseIds(prev => {
        const newSet = new Set(prev);
        isLiked ? newSet.delete(exerciseId) : newSet.add(exerciseId);
        return newSet;
      });
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleOpenAddToRoutine = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleSelectRoutine = async (routineId: number) => {
    if (!selectedExercise || !user?.id) return;
    try {
      await addExerciseToRoutineApi(routineId, selectedExercise.id);
      alert(`'${selectedExercise.name}' 운동을 루틴에 추가했습니다.`);
      setIsModalOpen(false);
      setSelectedExercise(null);
    } catch (error) {
      console.error("루틴에 운동 추가 실패:", error);
      alert("운동 추가에 실패했습니다.");
    }
  };

  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      const matchesCategory = selectedCategory === '전체' || ex.bodyPart === selectedCategory;
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allExercises, selectedCategory, searchTerm]);

  useEffect(() => {
    setExercisePage(0);
  }, [searchTerm, selectedCategory]);

  const totalExercisePages = Math.ceil(filteredExercises.length / EXERCISES_PER_PAGE);
  const paginatedExercises = useMemo(() => {
    const startIndex = exercisePage * EXERCISES_PER_PAGE;
    return filteredExercises.slice(startIndex, startIndex + EXERCISES_PER_PAGE);
  }, [filteredExercises, exercisePage]);
  const pageNumbers = useMemo(() => {
    if (totalExercisePages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalExercisePages }, (_, i) => i);
    }
    
    let startPage = Math.max(0, exercisePage - Math.floor((MAX_VISIBLE_PAGES - 1) / 2));
    let endPage = startPage + MAX_VISIBLE_PAGES - 1;

    if (endPage >= totalExercisePages) {
      endPage = totalExercisePages - 1;
      startPage = endPage - MAX_VISIBLE_PAGES + 1;
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [exercisePage, totalExercisePages]);

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main
        className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8"
        style={{ paddingTop: 'var(--header-height, 90px)' }}
      >
        <h1 className="text-3xl font-bold mb-6">운동 목록</h1>
        
        <ExerciseFilter
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategorySelect={(category) => setSelectedCategory(category as (typeof CATEGORIES)[number])}
          categories={CATEGORIES}
        />
        
        <ExerciseGrid
          exercises={paginatedExercises}
          likedExerciseIds={likedExerciseIds}
          onLikeToggle={handleLikeToggle}
          onAddToRoutine={handleOpenAddToRoutine}
        />

        {/* 페이지네이션 UI 추가 */}
        {totalExercisePages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setExercisePage(prev => Math.max(0, prev - 1));
                    }}
                    className={exercisePage === 0 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                {pageNumbers.map((pageIndex) => (
                  <PaginationItem key={pageIndex}>
                    <PaginationLink 
                      href="#"
                      onClick={(e) => { e.preventDefault(); setExercisePage(pageIndex); }}
                      isActive={exercisePage === pageIndex}
                    >
                      {pageIndex + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => { e.preventDefault(); setExercisePage(prev => Math.min(totalExercisePages - 1, prev + 1)); }}
                    className={exercisePage === totalExercisePages - 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        
        <AddToRoutineModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          routines={userRoutines}
          onSelectRoutine={handleSelectRoutine}
        />
      </main>
    </div>
  );
};

export default ExerciseListPage;