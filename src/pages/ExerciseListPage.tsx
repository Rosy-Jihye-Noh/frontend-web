import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Exercise, Routine, ProfileUser } from '@/types/index';
import type { RecommendationPayload, RecommendationResponse } from '@/types/recommendation';
import { useUserStore } from '@/store/userStore';
import Header from '@/components/common/Header';
import ExerciseFilter from '@/components/exercise/ExerciseFilter';
import ExerciseGrid from '@/components/exercise/ExerciseGrid';
import AddToRoutineModal from '@/components/exercise/AddToRoutineModal';
import RecommendedExercises from '@/components/exercise/RecommendedExercises';
import RecommendedExercisesLoader from '@/components/exercise/RecommendedExercisesLoader';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  fetchAllExercises,
  fetchUserLikes,
  fetchUserRoutines,
  addLikeApi,
  removeLikeApi,
  addExerciseToRoutineApi,
  fetchExerciseRecommendations,
} from '@/services/api/exerciseApi';
import { useRequireAuth } from "../hooks/useRequireAuth";
import { getLogsByUser } from '@/services/api/exerciseLogApi';
import { getPostureAnalysisHistory } from '@/services/api/analysisApi';

const CATEGORIES = ["전체", "전신", "다리", "옆구리", "허리", "허벅지", "엉덩이", "종아리", "팔", "가슴", "등", "어깨", "복부"] as const;
const EXERCISES_PER_PAGE = 12;
const MAX_VISIBLE_PAGES = 8;

const ExerciseListPage: React.FC = () => {
  useRequireAuth("/exercises");

  const { user } = useUserStore();
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [likedExerciseIds, setLikedExerciseIds] = useState<Set<number>>(new Set());
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);

  const [recommendationData, setRecommendationData] = useState<{ exercises: Exercise[]; reason: string } | null>(null);
  const [isRecLoading, setIsRecLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('전체');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exercisePage, setExercisePage] = useState(0);

  // 데이터 로딩이 이미 실행되었는지 추적하기 위한 ref
  const hasFetched = useRef<Record<number, boolean>>({});

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      setIsRecLoading(false);
      return;
    }

    // 현재 사용자에 대한 데이터 로딩이 이미 실행되었다면, 다시 실행하지 않음
    if (hasFetched.current[user.id]) {
      return;
    }

    const loadAllData = async () => {
      // 로딩이 실행됨을 기록하여 중복 실행 방지
      hasFetched.current[user.id] = true;
      setIsLoading(true);
      setIsRecLoading(true);
      
      try {
        const [exercisesData, likesData, routinesData] = await Promise.all([
          fetchAllExercises(),
          fetchUserLikes(user.id),
          fetchUserRoutines(user.id),
        ]);
        
        setAllExercises(exercisesData);
        setLikedExerciseIds(new Set(likesData.map((like) => like.exerciseId)));
        setUserRoutines(routinesData);
        setIsLoading(false);

        const recommendationKey = `ai_recommendations_${user.id}`;
        const timestampKey = `ai_recommendations_timestamp_${user.id}`;
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        const cachedRecs = localStorage.getItem(recommendationKey);
        const cachedTimestamp = localStorage.getItem(timestampKey);

        if (cachedRecs && cachedTimestamp && now - Number(cachedTimestamp) < oneDay) {
          setRecommendationData(JSON.parse(cachedRecs));
        } else {
          const postureHistory = await getPostureAnalysisHistory(user.id);
          const latestAnalysis = postureHistory.length > 0 ? postureHistory[0] : {};
          const exerciseHistory = await getLogsByUser(user.id);

          const payload: RecommendationPayload = {
            user_id: String(user.id),
            user_profile: user as ProfileUser,
            posture_analysis: latestAnalysis,
            exercise_history: exerciseHistory,
            liked_exercises: likesData,
            user_routines: routinesData,
          };

          const recResponse = await fetchExerciseRecommendations(payload);

          if (recResponse && recResponse.recommendations?.length > 0) {
            const enrichedRecommendations = recResponse.recommendations
              .map((recEx) => exercisesData.find((fullEx) => fullEx.name === recEx.name))
              .filter(Boolean) as Exercise[];

            if (enrichedRecommendations.length > 0) {
              const newRecData = {
                exercises: enrichedRecommendations,
                reason: recResponse.reason,
              };
              setRecommendationData(newRecData);
              localStorage.setItem(recommendationKey, JSON.stringify(newRecData));
              localStorage.setItem(timestampKey, String(now));
            }
          }
        }
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        setIsLoading(false);
      } finally {
        setIsRecLoading(false);
      }
    };

    loadAllData();
  }, [user]); // 의존성 배열은 user만 유지

  // ... (나머지 핸들러 및 렌더링 로직은 동일)
  const handleLikeToggle = async (exerciseId: number) => {
    if (!user?.id) return;
    const isLiked = likedExerciseIds.has(exerciseId);
    try {
      const api = isLiked ? removeLikeApi : addLikeApi;
      await api(user.id, exerciseId);
      setLikedExerciseIds((prev) => {
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
    return allExercises.filter((ex) => {
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

  if (isLoading) return <div>페이지 로딩 중...</div>;

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main
        className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8"
        style={{ paddingTop: 'var(--header-height, 90px)' }}
      >
        <h1 className="text-3xl font-bold mb-6">운동 목록</h1>

        {isRecLoading ? (
          <RecommendedExercisesLoader />
        ) : recommendationData && recommendationData.exercises.length > 0 ? (
          <RecommendedExercises recommendedData={recommendationData} />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-xl">🤔</p>
            <p className="mt-2">AI가 새로운 추천 운동을 찾지 못했어요.</p>
          </div>
        )}

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

        {totalExercisePages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setExercisePage((prev) => Math.max(0, prev - 1));
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
                    onClick={(e) => { e.preventDefault(); setExercisePage((prev) => Math.min(totalExercisePages - 1, prev + 1)); }}
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