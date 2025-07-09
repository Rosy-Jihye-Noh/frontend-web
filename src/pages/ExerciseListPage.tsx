import React, { useState, useEffect, useMemo } from 'react';
import type { Exercise, Routine } from '@/types/index';
import { useUserStore } from '@/store/userStore';
import Header from '@/components/common/Header'; // 공통 헤더 컴포넌트 임포트
import ExerciseFilter from '@/components/exercise/ExerciseFilter'; // 운동 필터 컴포넌트 임포트
import ExerciseGrid from '@/components/exercise/ExerciseGrid'; // 운동 목록 그리드 컴포넌트 임포트
import AddToRoutineModal from '@/components/exercise/AddToRoutineModal'; // 루틴 추가 모달 컴포넌트 임포트
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination" // Shadcn UI 페이지네이션 컴포넌트 임포트
import { 
  fetchAllExercises, // 모든 운동 목록을 가져오는 API 함수
  fetchUserLikes, // 사용자가 좋아요한 운동 목록을 가져오는 API 함수
  fetchUserRoutines, // 사용자의 루틴 목록을 가져오는 API 함수
  addLikeApi, // 운동에 좋아요를 추가하는 API 함수
  removeLikeApi, // 운동 좋아요를 제거하는 API 함수
  addExerciseToRoutineApi // 루틴에 운동을 추가하는 API 함수
} from '@/services/api/exerciseApi';

// 운동 카테고리 상수 정의 (읽기 전용 배열)
const CATEGORIES = ["전체", "전신", "다리", "옆구리", "허리", "허벅지", "엉덩이", "종아리", "팔", "가슴", "등", "어깨", "복부"] as const;
// 페이지당 표시할 운동 개수 상수
const EXERCISES_PER_PAGE = 12; 
// 페이지네이션에서 최대로 표시될 페이지 번호 개수
const MAX_VISIBLE_PAGES = 8;

// ExerciseListPage 함수형 컴포넌트 정의
const ExerciseListPage: React.FC = () => {
  const { user } = useUserStore(); // 전역 user 스토어에서 사용자 정보 가져오기

  // 컴포넌트 상태 변수들
  const [allExercises, setAllExercises] = useState<Exercise[]>([]); // 모든 운동 목록
  const [likedExerciseIds, setLikedExerciseIds] = useState<Set<number>>(new Set()); // 사용자가 좋아요한 운동 ID들을 저장하는 Set
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]); // 현재 사용자의 루틴 목록
  
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('전체'); // 선택된 카테고리 상태 (기본값: '전체')
  
  const [isModalOpen, setIsModalOpen] = useState(false); // '루틴에 추가' 모달 열림/닫힘 상태
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null); // 모달에 전달될 선택된 운동
  const [isLoading, setIsLoading] = useState(true); // 데이터 로딩 중인지 여부
  const [exercisePage, setExercisePage] = useState(0); // 현재 운동 목록 페이지 번호 (0부터 시작)

  // 컴포넌트 마운트 시 또는 사용자 ID 변경 시 초기 데이터를 불러오는 useEffect 훅
  useEffect(() => {
    if (!user?.id) return; // 사용자 ID가 없으면 함수 실행 중단

    // 초기 데이터를 비동기적으로 불러오는 함수 정의
    const loadInitialData = async () => {
      setIsLoading(true); // 로딩 상태 시작
      try {
        // 모든 운동, 사용자 좋아요 목록, 사용자 루틴 목록을 병렬로 동시에 불러옵니다.
        const [exercisesData, likesData, routinesData] = await Promise.all([
          fetchAllExercises(),
          fetchUserLikes(user.id),
          fetchUserRoutines(user.id)
        ]);
        setAllExercises(exercisesData); // 모든 운동 목록 상태 업데이트
        // 좋아요한 운동 ID들을 Set 객체로 변환하여 상태 업데이트 (빠른 검색을 위함)
        setLikedExerciseIds(new Set(likesData.map((like: { exerciseId: number }) => like.exerciseId)));
        setUserRoutines(routinesData); // 사용자 루틴 목록 상태 업데이트
      } catch (error) {
        console.error("데이터 로딩 실패:", error); // 오류 발생 시 콘솔에 에러 로깅
      } finally {
        setIsLoading(false); // 로딩 상태 종료
      }
    };
    loadInitialData(); // 초기 데이터 불러오기 함수 호출
  }, [user]); // user 객체가 변경될 때마다 이펙트 재실행

  /**
   * 운동 '좋아요' 상태를 토글하는 비동기 핸들러입니다.
   * @param exerciseId - 좋아요 상태를 변경할 운동의 ID
   */
  const handleLikeToggle = async (exerciseId: number) => {
    if (!user?.id) return; // 사용자 ID가 없으면 함수 실행 중단
    const isLiked = likedExerciseIds.has(exerciseId); // 현재 운동이 좋아요 상태인지 확인
    try {
      // isLiked 상태에 따라 좋아요 추가 또는 제거 API를 선택하여 호출
      const api = isLiked ? removeLikeApi : addLikeApi;
      await api(user.id, exerciseId); // API 호출
      
      // 낙관적 UI 업데이트: API 응답을 기다리지 않고 UI를 먼저 변경
      setLikedExerciseIds(prev => {
        const newSet = new Set(prev); // 이전 Set을 기반으로 새 Set 생성
        isLiked ? newSet.delete(exerciseId) : newSet.add(exerciseId); // 좋아요 상태에 따라 ID 추가 또는 제거
        return newSet; // 새 Set 반환
      });
    } catch (error) {
      console.error("좋아요 처리 실패:", error); // 오류 발생 시 콘솔에 에러 로깅
    }
  };

  /**
   * '루틴에 추가' 모달을 열고, 선택된 운동을 모달에 전달하기 위한 핸들러입니다.
   * @param exercise - 루틴에 추가할 운동 객체
   */
  const handleOpenAddToRoutine = (exercise: Exercise) => {
    setSelectedExercise(exercise); // 모달에 전달할 운동 설정
    setIsModalOpen(true); // 모달 열기
  };

  /**
   * '루틴에 추가' 모달에서 특정 루틴을 선택했을 때 호출되는 비동기 핸들러입니다.
   * 선택된 루틴에 운동을 추가하는 API를 호출합니다.
   * @param routineId - 운동을 추가할 루틴의 ID
   */
  const handleSelectRoutine = async (routineId: number) => {
    if (!selectedExercise || !user?.id) return; // 선택된 운동 또는 사용자 ID가 없으면 함수 종료 (방어 코드)
    try {
      await addExerciseToRoutineApi(routineId, selectedExercise.id); // 루틴에 운동 추가 API 호출
      alert(`'${selectedExercise.name}' 운동을 루틴에 추가했습니다.`); // 성공 알림
      setIsModalOpen(false); // 모달 닫기
      setSelectedExercise(null); // 선택된 운동 초기화
    } catch (error) {
      console.error("루틴에 운동 추가 실패:", error); // 오류 발생 시 콘솔에 에러 로깅
      alert("운동 추가에 실패했습니다."); // 사용자에게 실패 알림
    }
  };

  // 모든 운동 목록, 선택된 카테고리, 검색어가 변경될 때마다 필터링된 운동 목록을 계산하는 useMemo 훅
  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      // 1. 카테고리 일치 여부 확인: '전체' 카테고리이거나 운동의 bodyPart가 선택된 카테고리와 일치하는지
      const matchesCategory = selectedCategory === '전체' || ex.bodyPart === selectedCategory;
      // 2. 검색어 일치 여부 확인: 운동 이름이 검색어를 포함하는지 (대소문자 구분 없이)
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch; // 두 조건 모두 만족하는 운동만 반환
    });
  }, [allExercises, selectedCategory, searchTerm]); // 의존성 배열

  // 검색어 또는 선택된 카테고리가 변경될 때 현재 페이지를 0으로 초기화하는 useEffect
  useEffect(() => {
    setExercisePage(0);
  }, [searchTerm, selectedCategory]);

  // 필터링된 운동의 총 페이지 수 계산
  const totalExercisePages = Math.ceil(filteredExercises.length / EXERCISES_PER_PAGE);
  
  // 현재 페이지에 해당하는 운동 목록을 슬라이싱하여 반환하는 useMemo 훅
  const paginatedExercises = useMemo(() => {
    const startIndex = exercisePage * EXERCISES_PER_PAGE; // 현재 페이지의 시작 인덱스
    return filteredExercises.slice(startIndex, startIndex + EXERCISES_PER_PAGE); // 해당 범위의 운동만 잘라내어 반환
  }, [filteredExercises, exercisePage]); // 의존성 배열

  // 페이지네이션에서 표시할 페이지 번호 배열을 계산하는 useMemo 훅
  const pageNumbers = useMemo(() => {
    if (totalExercisePages <= MAX_VISIBLE_PAGES) {
      // 전체 페이지 수가 최대 표시 개수보다 작거나 같으면 모든 페이지 번호를 반환
      return Array.from({ length: totalExercisePages }, (_, i) => i);
    }
    
    // 현재 페이지를 기준으로 보이는 페이지 번호 범위 계산
    let startPage = Math.max(0, exercisePage - Math.floor((MAX_VISIBLE_PAGES - 1) / 2));
    let endPage = startPage + MAX_VISIBLE_PAGES - 1;

    // 계산된 `endPage`가 전체 페이지 수를 초과하면 조정
    if (endPage >= totalExercisePages) {
      endPage = totalExercisePages - 1; // 마지막 페이지로 설정
      startPage = endPage - MAX_VISIBLE_PAGES + 1; // 시작 페이지를 다시 계산하여 최대 개수를 유지
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i); // 페이지 번호 추가
    }
    return pages; // 계산된 페이지 번호 배열 반환
  }, [exercisePage, totalExercisePages]); // 의존성 배열

  // 로딩 중일 때 표시할 UI
  if (isLoading) return <div className="flex justify-center items-center h-screen">로딩 중...</div>;

  // 컴포넌트 렌더링
  return (
    <div className="bg-background min-h-screen"> {/* 전체 배경색 및 최소 높이 설정 */}
      <Header /> {/* 상단 헤더 컴포넌트 */}
      <main
        className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" // 최대 너비, 중앙 정렬, 반응형 패딩
        style={{ paddingTop: 'var(--header-height, 90px)' }} // 헤더 높이만큼 상단 패딩 추가
      >
        <h1 className="text-3xl font-bold mb-6">운동 목록 💪</h1> {/* 페이지 제목 */}
        
        {/* 운동 필터 컴포넌트 */}
        <ExerciseFilter
          searchTerm={searchTerm} // 현재 검색어 전달
          onSearchTermChange={setSearchTerm} // 검색어 변경 핸들러 전달
          selectedCategory={selectedCategory} // 선택된 카테고리 전달
          onCategorySelect={(category) => setSelectedCategory(category as (typeof CATEGORIES)[number])} // 카테고리 선택 핸들러 전달
          categories={CATEGORIES} // 사용 가능한 카테고리 목록 전달
        />
        
        {/* 운동 목록 그리드 컴포넌트 */}
        <ExerciseGrid
          exercises={paginatedExercises} // 현재 페이지에 해당하는 운동 목록 전달
          likedExerciseIds={likedExerciseIds} // 좋아요한 운동 ID 목록 전달
          onLikeToggle={handleLikeToggle} // 좋아요 토글 핸들러 전달
          onAddToRoutine={handleOpenAddToRoutine} // 루틴 추가 모달 열기 핸들러 전달
        />

        {/* 페이지네이션 UI */}
        {totalExercisePages > 1 && ( // 총 페이지가 1보다 많을 때만 페이지네이션 표시
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                {/* 이전 페이지 버튼 */}
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" // 링크는 SPA이므로 의미 없음, onClick으로 제어
                    onClick={(e) => {
                      e.preventDefault(); // 기본 링크 동작 방지
                      setExercisePage(prev => Math.max(0, prev - 1)); // 이전 페이지로 이동 (최소 0)
                    }}
                    // 첫 페이지에서는 비활성화
                    className={exercisePage === 0 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                {/* 페이지 번호 링크들 */}
                {pageNumbers.map((pageIndex) => (
                  <PaginationItem key={pageIndex}>
                    <PaginationLink 
                      href="#"
                      onClick={(e) => { e.preventDefault(); setExercisePage(pageIndex); }} // 클릭 시 해당 페이지로 이동
                      isActive={exercisePage === pageIndex} // 현재 페이지이면 활성화 스타일 적용
                    >
                      {pageIndex + 1} {/* 페이지 번호 표시 (0부터 시작하므로 +1) */}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {/* 다음 페이지 버튼 */}
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => { e.preventDefault(); setExercisePage(prev => Math.min(totalExercisePages - 1, prev + 1)); }} // 다음 페이지로 이동 (최대 총 페이지 - 1)
                    // 마지막 페이지에서는 비활성화
                    className={exercisePage === totalExercisePages - 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        
        {/* 루틴 추가 모달 */}
        <AddToRoutineModal
          isOpen={isModalOpen} // 모달 열림/닫힘 상태
          onClose={() => setIsModalOpen(false)} // 모달 닫기 핸들러
          routines={userRoutines} // 사용자 루틴 목록 전달
          onSelectRoutine={handleSelectRoutine} // 루틴 선택 핸들러 전달
        />
      </main>
    </div>
  );
};

export default ExerciseListPage;