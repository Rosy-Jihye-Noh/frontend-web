import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Exercise } from '@/types/index';
// API 서비스 임포트: 모든 운동 조회, 루틴 ID로 루틴 조회, 루틴 업데이트, 좋아요한 운동 조회
import { fetchAllExercises } from '@/services/api/exerciseApi';
import { fetchRoutineById, updateRoutine } from '@/services/api/routineApi';
import { fetchFullLikedExercises } from '@/services/api/myPageApi';
import { useUserStore } from '@/store/userStore';

// 재사용할 컴포넌트들 임포트
import Header from '@/components/common/Header'; // 공통 헤더 컴포넌트
import RoutineInfoForm from '@/components/routine/RoutineInfoForm'; // 루틴 이름/설명 입력 폼
import AvailableExercisesList from '@/components/routine/AvailableExercisesList'; // 선택 가능한 운동 목록
import SelectedExercisesList from '@/components/routine/SelectedExercisesList'; // 루틴에 포함된 운동 목록
import { Button } from '@/components/ui/button'; // Shadcn UI 버튼 컴포넌트

// RoutineEditPage 함수형 컴포넌트
const RoutineEditPage: React.FC = () => {
  const navigate = useNavigate(); // 페이지 이동 함수
  // URL 파라미터에서 `routineId`를 가져옵니다.
  const { routineId } = useParams<{ routineId: string }>();
  const { user } = useUserStore(); // 전역 user 스토어에서 사용자 정보 가져오기

  // 폼 입력 및 운동 목록 관련 상태
  const [routineName, setRoutineName] = useState(''); // 루틴 이름
  const [description, setDescription] = useState(''); // 루틴 설명
  const [searchTerm, setSearchTerm] = useState(''); // 운동 검색어
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]); // 모든 운동 목록
  const [likedExercises, setLikedExercises] = useState<Exercise[]>([]); // 사용자가 좋아요한 운동 목록
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]); // 현재 루틴에 포함된 운동 목록

  // UI 상태
  const [isSaving, setIsSaving] = useState(false); // 루틴 저장 중인지 여부
  const [isLoading, setIsLoading] = useState(true); // 페이지 로딩 중인지 여부 (초기 데이터 로딩)

  /**
   * '선택된 운동' 목록에서 특정 운동의 순서를 위로 옮기는 핸들러입니다.
   * @param index - 이동할 운동의 현재 인덱스
   */
  const handleMoveUp = (index: number) => {
    if (index === 0) return; // 이미 맨 위에 있는 항목은 더 이상 위로 이동 불가
    const newExercises = [...selectedExercises]; // 불변성을 위해 배열 복사
    // 배열 요소 위치 교환 (index-1 위치의 요소와 index 위치의 요소를 바꿈)
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    setSelectedExercises(newExercises); // 변경된 배열로 상태 업데이트
  };

  /**
   * '선택된 운동' 목록에서 특정 운동의 순서를 아래로 옮기는 핸들러입니다.
   * @param index - 이동할 운동의 현재 인덱스
   */
  const handleMoveDown = (index: number) => {
    if (index === selectedExercises.length - 1) return; // 이미 맨 아래에 있는 항목은 더 이상 아래로 이동 불가
    const newExercises = [...selectedExercises]; // 불변성을 위해 배열 복사
    // 배열 요소 위치 교환 (index 위치의 요소와 index+1 위치의 요소를 바꿈)
    [newExercises[index + 1], newExercises[index]] = [newExercises[index], newExercises[index + 1]];
    setSelectedExercises(newExercises); // 변경된 배열로 상태 업데이트
  };

  // 컴포넌트 마운트 시 또는 `routineId`, `user` 객체가 변경될 때 데이터를 불러오는 useEffect 훅
  useEffect(() => {
    const loadData = async () => {
      try {
        // 기존 루틴 데이터와 모든 운동 목록을 병렬로 동시에 불러옵니다.
        const [routineData, allExercises] = await Promise.all([
          fetchRoutineById(Number(routineId)), // 루틴 ID를 숫자로 변환하여 API 호출
          fetchAllExercises() // 모든 운동 목록 호출
        ]);
        
        // 불러온 루틴 데이터로 폼 상태 초기화
        setRoutineName(routineData.name);
        setDescription(routineData.description || ''); // description이 없으면 빈 문자열로 설정

        // 루틴에 포함된 운동들을 순서(order)에 따라 정렬하고, 각 운동의 상세 정보를 매핑합니다.
        // `find`가 실패할 수 있으므로 `filter(Boolean)`으로 유효한 운동만 남깁니다.
        const sortedExercises = routineData.exercises.sort((a, b) => a.order - b.order);
        const exerciseDetails = sortedExercises
                                  .map(re => allExercises.find((e: Exercise) => e.id === re.exerciseId))
                                  .filter(Boolean) as Exercise[];
        
        setSelectedExercises(exerciseDetails); // 루틴에 포함된 운동 상태 설정
        setAvailableExercises(allExercises); // 모든 운동 목록 상태 설정
        
        // 사용자가 로그인되어 있을 경우에만 좋아요한 운동 데이터를 불러옵니다.
        if (user?.id) {
          const liked = await fetchFullLikedExercises(user.id);
          setLikedExercises(liked); // 좋아요한 운동 목록 상태 설정
        }
        
        setIsLoading(false); // 로딩 종료
      } catch (err) {
        console.error("데이터 로딩 실패:", err); // 오류 발생 시 콘솔에 에러 로깅
        alert("루틴 정보를 불러오는데 실패했습니다."); // 사용자에게 알림
        setIsLoading(false); // 로딩 종료
      }
    };

    loadData(); // 데이터 불러오기 함수 호출
  }, [routineId, user]); // `routineId` 또는 `user` 객체가 변경될 때마다 이펙트 재실행

  // 검색어와 현재 '선택된 운동'을 기반으로 필터링된 '선택 가능한 운동' 목록을 계산하는 useMemo 훅
  const filteredAvailableExercises = useMemo(() => {
    // 이미 선택된 운동들의 ID를 Set으로 만듭니다. (빠른 검색을 위함)
    const selectedIds = new Set(selectedExercises.map(ex => ex.id));
    return availableExercises.filter(ex => 
      // 운동 이름이 검색어를 포함하고 (대소문자 구분 없이),
      // 아직 선택된 운동 목록에 없는 경우에만 필터링합니다.
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedIds.has(ex.id)
    );
  }, [searchTerm, availableExercises, selectedExercises]); // 의존성 배열

  /**
   * 운동을 '선택된 운동' 목록에 추가하는 핸들러입니다.
   * @param exercise - 추가할 운동 객체
   */
  const handleAddExercise = (exercise: Exercise) => {
    setSelectedExercises(prev => [...prev, exercise]); // 이전 목록에 새 운동을 추가
  };

  /**
   * 운동을 '선택된 운동' 목록에서 제거하는 핸들러입니다.
   * @param exerciseId - 제거할 운동의 ID
   */
  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId)); // 해당 ID의 운동을 필터링하여 제거
  };

  /**
   * 루틴 변경사항을 저장하는 비동기 핸들러입니다.
   * 유효성 검사를 수행하고, API를 호출하여 루틴을 업데이트합니다.
   */
  const handleUpdateRoutine = async () => {
    if (!routineId) return; // routineId가 없으면 함수 종료

    setIsSaving(true); // 저장 중 상태로 변경

    // 서버에 전송할 루틴 업데이트 데이터 객체 구성
    const routineData = {
      name: routineName, // 변경된 루틴 이름
      description: description, // 변경된 루틴 설명
      // 업데이트될 운동 목록: 순서에 따라 정렬하고 필요한 정보만 매핑
      exercises: selectedExercises.map((ex, index) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        order: index + 1, // 순서는 1부터 시작하도록 설정
      })),
    };

    try {
      // `updateRoutine` API를 호출하여 루틴 업데이트
      await updateRoutine(Number(routineId), routineData); // routineId를 숫자로 변환
      alert('루틴이 성공적으로 수정되었습니다! ✨'); // 성공 알림
      navigate(`/routines/${routineId}`); // 수정된 루틴의 상세 페이지로 이동
    } catch (error) {
      console.error('루틴 수정 실패:', error); // 콘솔에 에러 로깅
      alert('루틴 수정에 실패했습니다. 😭'); // 사용자에게 실패 알림
    } finally {
      setIsSaving(false); // 저장 중 상태 해제
    }
  };

  // 페이지 로딩 중일 때 표시할 UI
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">루틴 정보를 불러오는 중... 🔄</div>;
  }

  // 컴포넌트 렌더링
  return (
    <div className="bg-background min-h-screen"> {/* 전체 배경색 및 최소 화면 높이 설정 */}
      <Header /> {/* 상단 헤더 컴포넌트 */}
      <main
        className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" // 메인 콘텐츠 영역 (최대 너비, 중앙 정렬, 반응형 패딩)
        style={{ paddingTop: 'var(--header-height, 90px)' }} // 헤더 높이만큼 상단 패딩 추가
      >
        {/* 페이지 제목 및 저장/취소 버튼 섹션 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">루틴 편집 ✏️</h1>
          <div className="flex gap-2">
            {/* '취소' 버튼: 클릭 시 이전 페이지로 이동 */}
            <Button variant="outline" onClick={() => navigate(-1)}>취소</Button>
            {/* '변경사항 저장' 버튼: 클릭 시 `handleUpdateRoutine` 호출, 저장 중일 때 비활성화 */}
            <Button onClick={handleUpdateRoutine} disabled={isSaving}>
              {isSaving ? '저장 중...' : '변경사항 저장'}
            </Button>
          </div>
        </div>

        {/* 루틴 정보 폼과 운동 목록을 위한 2열 그리드 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 왼쪽 컬럼: 루틴 정보 폼 및 선택 가능한 운동 목록 */}
          <div className="space-y-6"> {/* 내부 요소 간 세로 간격 */}
            <RoutineInfoForm
              routineName={routineName}
              description={description}
              onNameChange={setRoutineName}
              onDescriptionChange={setDescription}
            />
            <AvailableExercisesList
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              exercises={filteredAvailableExercises}
              likedExercises={likedExercises}
              onAddExercise={handleAddExercise}
            />
          </div>
          {/* 오른쪽 컬럼: 루틴에 포함된 운동 목록 */}
          <SelectedExercisesList
            exercises={selectedExercises}
            onRemoveExercise={handleRemoveExercise}
            onMoveUp={handleMoveUp} // 운동 순서 위로 이동 핸들러 전달
            onMoveDown={handleMoveDown} // 운동 순서 아래로 이동 핸들러 전달
          />
        </div>
      </main>
    </div>
  );
};

export default RoutineEditPage;