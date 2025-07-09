import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { Exercise } from '@/types/index';
// API 서비스 임포트: 모든 운동 조회, 루틴 생성, 좋아요한 운동 조회
import { fetchAllExercises } from '@/services/api/exerciseApi';
import { createRoutine } from '@/services/api/routineApi';
import { fetchFullLikedExercises } from '@/services/api/myPageApi';

import Header from '@/components/common/Header'; // 공통 헤더 컴포넌트 임포트
import RoutinePageHeader from '@/components/routine/RoutinePageHeader'; // 루틴 페이지 헤더 (저장/취소 버튼 포함) 컴포넌트 임포트
import RoutineInfoForm from '@/components/routine/RoutineInfoForm'; // 루틴 이름/설명 입력 폼 컴포넌트 임포트
import AvailableExercisesList from '@/components/routine/AvailableExercisesList'; // 선택 가능한 운동 목록 컴포넌트 임포트
import SelectedExercisesList from '@/components/routine/SelectedExercisesList'; // 루틴에 포함된 운동 목록 컴포넌트 임포트

// RoutineCreatePage 함수형 컴포넌트 정의
const RoutineCreatePage: React.FC = () => {
  const navigate = useNavigate(); // 페이지 이동 함수
  const { user } = useUserStore(); // 전역 user 스토어에서 사용자 정보 가져오기

  // 루틴 정보 폼 관련 상태
  const [routineName, setRoutineName] = useState(''); // 루틴 이름
  const [description, setDescription] = useState(''); // 루틴 설명
  const [searchTerm, setSearchTerm] = useState(''); // 운동 검색어

  // 운동 목록 관련 상태
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]); // API에서 불러온 모든 운동 목록
  const [likedExercises, setLikedExercises] = useState<Exercise[]>([]); // 사용자가 좋아요한 운동 목록
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]); // 현재 루틴에 추가된 운동 목록

  // 저장 상태
  const [isSaving, setIsSaving] = useState(false); // 루틴 저장 중인지 여부

  // 컴포넌트 마운트 시 모든 운동 및 좋아요한 운동 데이터를 불러오는 useEffect 훅
  useEffect(() => {
    const loadData = async () => {
      try {
        // 모든 운동 데이터를 비동기적으로 불러옵니다.
        const exercises = await fetchAllExercises();
        setAvailableExercises(exercises); // 상태 업데이트
        
        // 사용자가 로그인되어 있을 경우에만 좋아요한 운동 데이터를 불러옵니다.
        if (user?.id) {
          const liked = await fetchFullLikedExercises(user.id);
          setLikedExercises(liked); // 상태 업데이트
        }
      } catch (err) {
        console.error("데이터 로딩 실패:", err); // 오류 발생 시 콘솔에 에러 로깅
      }
    };

    loadData(); // 데이터 불러오기 함수 호출
  }, [user]); // user 객체가 변경될 때마다 이펙트 재실행

  // 검색어와 현재 선택된 운동을 기반으로 필터링된 '선택 가능한 운동' 목록을 계산하는 useMemo 훅
  // 이 목록은 'availableExercises'에서 'selectedExercises'에 이미 포함된 운동을 제외합니다.
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
   * 새로운 루틴을 저장하는 비동기 핸들러입니다.
   * 유효성 검사를 수행하고, API를 호출하여 루틴을 생성합니다.
   */
  const handleSaveRoutine = async () => {
    // 1. 루틴 이름 유효성 검사
    if (!routineName.trim()) { // trim()으로 공백 제거 후 비어있는지 확인
      alert('루틴 이름을 입력해주세요.');
      return;
    }
    // 2. 선택된 운동 개수 유효성 검사
    if (selectedExercises.length === 0) {
      alert('하나 이상의 운동을 추가해주세요.');
      return;
    }
    // 3. 사용자 로그인 상태 확인
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login'); // 로그인 페이지로 이동 요청
      return;
    }

    setIsSaving(true); // 저장 중 상태로 변경

    // 서버에 전송할 루틴 데이터 객체 구성
    const routineData = {
      name: routineName, // 루틴 이름
      description: description, // 루틴 설명
      userId: user.id, // 루틴을 생성하는 사용자 ID
      exercises: selectedExercises.map((ex, index) => ({ // 선택된 운동들을 API 형식에 맞게 변환
        exerciseId: ex.id,
        exerciseName: ex.name,
        order: index + 1, // 운동 순서 (1부터 시작)
      })),
    };

    try {
      // `createRoutine` API를 호출하여 루틴 생성
      // API 함수에 userId를 별도로 전달하는 경우, 해당 API가 userId를 경로 또는 헤더에 필요로 할 때 사용합니다.
      await createRoutine(routineData, user.id); 
      alert('새로운 루틴이 성공적으로 생성되었습니다! 🎉'); // 성공 알림
      navigate('/mypage'); // 마이페이지로 이동
    } catch (error) {
      console.error('루틴 저장 실패:', error); // 콘솔에 에러 로깅
      alert('루틴 저장에 실패했습니다. 😭'); // 사용자에게 실패 알림
    } finally {
      setIsSaving(false); // 저장 중 상태 해제
    }
  };

  // 컴포넌트 렌더링
  return (
    <div className="bg-background min-h-screen"> {/* 전체 배경색 및 최소 높이 설정 */}
      <Header /> {/* 상단 헤더 컴포넌트 */}
      <main
        className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" // 최대 너비, 중앙 정렬, 반응형 패딩
        style={{ paddingTop: 'var(--header-height, 90px)' }} // 헤더 높이만큼 상단 패딩 추가
      >
        {/* 루틴 페이지 헤더 (저장 및 취소 버튼 포함) */}
        <RoutinePageHeader
          isSaving={isSaving} // 저장 중 상태 전달
          onSave={handleSaveRoutine} // 저장 핸들러 전달
          onCancel={() => navigate('/mypage')} // 취소 시 마이페이지로 이동
        />

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
              exercises={filteredAvailableExercises} // 필터링된 운동 목록 전달
              likedExercises={likedExercises} // 좋아요한 운동 목록 전달
              onAddExercise={handleAddExercise} // 운동 추가 핸들러 전달
            />
          </div>
          
          {/* 오른쪽 컬럼: 루틴에 포함된 운동 목록 */}
          <SelectedExercisesList
            exercises={selectedExercises} // 선택된 운동 목록 전달
            onRemoveExercise={handleRemoveExercise} // 운동 제거 핸들러 전달
            // 운동 순서를 위로 옮기는 핸들러 (findIndex로 해당 운동 ID의 인덱스 찾아서 배열 재정렬)
            onMoveUp={(exerciseId: number) => {
              setSelectedExercises(prev => {
                const idx = prev.findIndex(ex => ex.id === exerciseId);
                if (idx > 0) { // 첫 번째 운동이 아니면
                  const newArr = [...prev]; // 배열 복사
                  [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]]; // 바로 위 운동과 위치 교환
                  return newArr;
                }
                return prev; // 변경 없음
              });
            }}
            // 운동 순서를 아래로 옮기는 핸들러 (findIndex로 해당 운동 ID의 인덱스 찾아서 배열 재정렬)
            onMoveDown={(exerciseId: number) => {
              setSelectedExercises(prev => {
                const idx = prev.findIndex(ex => ex.id === exerciseId);
                if (idx !== -1 && idx < prev.length - 1) { // 마지막 운동이 아니면
                  const newArr = [...prev]; // 배열 복사
                  [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]]; // 바로 아래 운동과 위치 교환
                  return newArr;
                }
                return prev; // 변경 없음
              });
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default RoutineCreatePage;