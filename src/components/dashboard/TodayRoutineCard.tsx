import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { HiCheckCircle, HiPlus, HiPencilAlt } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import type { Routine } from '@/types/index';

// TodayWorkoutCard 컴포넌트의 props 인터페이스
interface TodayWorkoutCardProps {
  selectedRoutines: Routine[]; // 오늘 선택된 루틴 배열
  allUserRoutines: Routine[]; // 모든 사용자 루틴 배열
  onRoutineSelect: (routines: Routine[]) => void; // 루틴 선택 시 호출되는 콜백 함수
  onStart: () => void;
}

// TodayWorkoutCard 함수형 컴포넌트
const TodayWorkoutCard: React.FC<TodayWorkoutCardProps> = ({
  selectedRoutines,
  allUserRoutines,
  onRoutineSelect
}) => {
  const { user } = useUserStore();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempSelectedRoutines, setTempSelectedRoutines] = useState<Routine[]>(selectedRoutines);
  const [todayCompletedRoutines, setTodayCompletedRoutines] = useState<string[]>([]);
  const [routineCompletionData, setRoutineCompletionData] = useState<{ [routineName: string]: number }>({});

  /**
   * 로컬 스토리지의 'exercise-log-storage'에서 오늘 날짜에 선택된 루틴을 불러옵니다.
   * 이 함수는 로그 데이터를 읽고 파싱하여 오늘 날짜의 루틴 ID를 추출한 다음,
   * 사용자의 전체 루틴과 매칭하여 반환합니다.
   * @returns {Routine[]} 오늘을 위해 선택된 루틴 배열
   */
  const getTodaySelectedRoutinesFromStorage = () => {
    try {
      if (!user?.id) return []; // 사용자 ID가 없으면 빈 배열 반환

      const logData = localStorage.getItem('exercise-log-storage');
      if (!logData) return []; // 로그 데이터가 없으면 빈 배열 반환

      const parsedData = JSON.parse(logData);
      const todayDate = getTodayDateString(); // 오늘 날짜 문자열 가져오기

      // 파싱된 로그에서 오늘 날짜의 세션 데이터에 접근
      const todaySessions = parsedData?.state?.sessions?.[todayDate];
      if (!todaySessions || !Array.isArray(todaySessions)) return []; // 오늘 세션이 없거나 배열이 아니면 빈 배열 반환

      // 오늘 세션에서 루틴 ID들만 추출 (유효한 ID만 필터링)
      const routineIds = todaySessions.map((session: any) => session.routineId).filter(Boolean);

      // 사용자 전체 루틴 중에서 오늘 선택된 루틴 ID와 일치하고 현재 사용자의 루틴인 것만 필터링하여 반환
      return allUserRoutines.filter(routine =>
        routineIds.includes(routine.id) && routine.userId === user.id
      );
    } catch (error) {
      console.error('오늘 선택된 루틴 가져오기 실패:', error);
      return [];
    }
  };

  /**
   * 선택된 루틴들을 로컬 스토리지의 'exercise-log-storage'에 오늘 날짜의 세션으로 저장합니다.
   * 기존 로그 데이터가 있으면 업데이트하고, 없으면 새로 생성합니다.
   * @param {Routine[]} routines - 오늘 선택된 루틴 배열
   */
  const saveSelectedRoutinesToStorage = (routines: Routine[]) => {
    try {
      if (!user?.id) return; // 사용자 ID가 없으면 함수 종료

      const logData = localStorage.getItem('exercise-log-storage');
      const todayDate = getTodayDateString(); // 오늘 날짜 문자열 가져오기

      let parsedData;
      // 기존 로그 데이터가 있으면 파싱하고, 없으면 초기 데이터 구조 생성
      if (logData) {
        parsedData = JSON.parse(logData);
      } else {
        parsedData = { state: { selectedDate: todayDate, sessions: {}, currentDayMemo: '' }, version: 0 };
      }

      // 'state' 및 'state.sessions' 속성이 없으면 초기화
      if (!parsedData.state) {
        parsedData.state = { selectedDate: todayDate, sessions: {}, currentDayMemo: '' };
      }

      if (!parsedData.state.sessions) {
        parsedData.state.sessions = {};
      }

      // 오늘 날짜의 세션 생성 또는 업데이트
      if (routines.length === 0) {
        // 선택된 루틴이 없으면 오늘 날짜 세션을 빈 배열로 설정
        parsedData.state.sessions[todayDate] = [];
      } else {
        // 선택된 루틴들을 세션 형태로 변환
        const sessionRoutines = routines.map(routine => ({
          logId: null, // 로그 ID는 나중에 할당될 수 있음
          routineId: routine.id,
          routineName: routine.name,
          exercises: routine.exercises.map((ex: any) => ({ // 각 운동도 세션 형태로 변환
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            isCompleted: false, // 초기에는 완료되지 않음으로 설정
          })),
          completionRate: 0, // 초기 완료율은 0
        }));

        parsedData.state.sessions[todayDate] = sessionRoutines;
      }

      // 변경된 데이터를 로컬 스토리지에 다시 저장
      localStorage.setItem('exercise-log-storage', JSON.stringify(parsedData));
      console.log('오늘 루틴 선택 저장 완료:', routines.map(r => r.name));
    } catch (error) {
      console.error('루틴 저장 실패:', error);
    }
  };

  /**
   * 현재 날짜를 'YYYY-MM-DD' 형식의 문자열로 반환합니다.
   * @returns {string} 오늘 날짜 문자열
   */
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // ISO 문자열에서 날짜 부분만 추출
  };

  /**
   * 로컬 스토리지의 'exercise-log-storage'에서 오늘 완료된 루틴 정보와
   * 각 루틴의 완료율 정보를 가져옵니다.
   * @returns {{ completedRoutines: string[]; routineCompletionData: { [routineName: string]: number } }}
   * 완료된 루틴 이름 배열과 루틴별 완료율 객체를 반환합니다.
   */
  const getRoutineCompletionFromStorage = () => {
    try {
      const logData = localStorage.getItem('exercise-log-storage');
      if (!logData) {
        return { completedRoutines: [], routineCompletionData: {} }; // 데이터 없으면 빈 값 반환
      }

      const parsedData = JSON.parse(logData);
      const todayDate = getTodayDateString(); // 오늘 날짜 문자열 가져오기

      // 오늘 날짜의 세션 데이터에 접근
      const todaySessions = parsedData?.state?.sessions?.[todayDate];
      if (!todaySessions) {
        return { completedRoutines: [], routineCompletionData: {} }; // 오늘 세션 없으면 빈 값 반환
      }

      const routineCompletionData: { [routineName: string]: number } = {};
      const completedRoutines: string[] = [];

      // 오늘 세션의 각 항목을 순회하며 루틴 이름과 완료율 확인
      Object.values(todaySessions).forEach((session: any) => {
        if (session && session.routineName) {
          const routineName = session.routineName;
          const completionRate = session.completionRate || 0; // 완료율이 없으면 0으로 설정

          // 루틴별 최대 완료율 저장 (여러 번 기록될 경우 가장 높은 완료율 유지)
          if (!routineCompletionData[routineName] || routineCompletionData[routineName] < completionRate) {
            routineCompletionData[routineName] = completionRate;
          }

          // 완료율이 100%이고 아직 완료된 루틴 목록에 없으면 추가
          if (completionRate === 100 && !completedRoutines.includes(routineName)) {
            completedRoutines.push(routineName);
          }
        }
      });

      return { completedRoutines, routineCompletionData };
    } catch (error) {
      // 오류 발생 시 빈 값 반환
      return { completedRoutines: [], routineCompletionData: {} };
    }
  };

  // `selectedRoutines` prop이 변경될 때마다 `tempSelectedRoutines` 상태를 동기화
  useEffect(() => {
    setTempSelectedRoutines(selectedRoutines);
  }, [selectedRoutines]);

  // 컴포넌트 마운트 시 로컬 스토리지에서 오늘 선택된 루틴을 복원하는 Effect
  useEffect(() => {
    // 사용자 ID가 있고, 사용자 루틴이 로드되었으며, 현재 선택된 루틴이 없을 때만 복원 시도
    if (user?.id && allUserRoutines.length > 0) {
      const todayStorageRoutines = getTodaySelectedRoutinesFromStorage();
      // 로컬 스토리지에 오늘 날짜 세션이 존재하고, 현재 앱 상태에 선택된 루틴이 없을 경우에만 복원
      if (todayStorageRoutines.length > 0 && selectedRoutines.length === 0) {
        onRoutineSelect(todayStorageRoutines); // 복원된 루틴으로 상태 업데이트
      }
    }
  }, [user?.id, allUserRoutines.length]);

  // 컴포넌트 마운트 시, 주기적으로, 그리고 로컬 스토리지 변경 시 완료된 루틴 및 선택된 루틴 상태를 업데이트하는 Effect
  useEffect(() => {
    // 완료된 루틴 및 완료율을 업데이트하는 내부 함수
    const updateCompletedRoutines = () => {
      const { completedRoutines, routineCompletionData } = getRoutineCompletionFromStorage();
      setTodayCompletedRoutines(completedRoutines); // 완료된 루틴 목록 업데이트
      setRoutineCompletionData(routineCompletionData); // 루틴별 완료율 데이터 업데이트

      // 로컬 스토리지에서 오늘 선택된 루틴을 확인하여 현재 상태와 동기화
      if (user?.id && allUserRoutines.length > 0) {
        const todayStorageRoutines = getTodaySelectedRoutinesFromStorage();
        if (todayStorageRoutines.length > 0 && selectedRoutines.length === 0) {
          onRoutineSelect(todayStorageRoutines);
        }
      }
    };

    updateCompletedRoutines(); // 컴포넌트 마운트 시 즉시 업데이트

    // 로컬 스토리지 변경 이벤트 리스너 추가 (다른 탭이나 창에서 로컬 스토리지 변경 시 감지)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'exercise-log-storage') { // 'exercise-log-storage' 키의 변경만 감지
        updateCompletedRoutines();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 5초마다 완료된 루틴 정보를 확인하고 업데이트하는 Interval 설정 (실시간 업데이트 효과)
    const interval = setInterval(updateCompletedRoutines, 5000);

    // 컴포넌트 언마운트 시 이벤트 리스너와 인터벌 클린업
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user?.id, allUserRoutines.length, selectedRoutines.length]); // 의존성 배열: 사용자 ID, 모든 루틴 길이, 선택된 루틴 길이

  /**
   * 다이얼로그 내에서 루틴 체크박스를 토글(선택/해제)하는 핸들러.
   * `tempSelectedRoutines` 상태를 업데이트합니다.
   * @param {Routine} routine - 토글할 루틴 객체
   */
  const handleRoutineToggle = (routine: Routine) => {
    setTempSelectedRoutines(prev =>
      prev.some(r => r.id === routine.id) // 이미 선택된 루틴이면
        ? prev.filter(r => r.id !== routine.id) // 제거
        : [...prev, routine] // 아니면 추가
    );
  };

  /**
   * 루틴 선택 다이얼로그에서 '선택 완료' 버튼을 클릭했을 때 호출되는 핸들러.
   * 로그인 상태 및 선택된 루틴의 유효성을 검증한 후,
   * 로컬 스토리지에 선택된 루틴을 저장하고 부모 컴포넌트에 알립니다.
   */
  const handleConfirmSelection = () => {
    // 1. 로그인 상태 확인
    if (!user || !user.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 2. 선택된 루틴이 모두 현재 사용자의 루틴인지 검증
    const validRoutines = tempSelectedRoutines.filter(routine =>
      allUserRoutines.some(userRoutine =>
        userRoutine.id === routine.id && userRoutine.userId === user.id
      )
    );

    // 유효하지 않은 루틴이 포함되어 있으면 경고 메시지 표시
    if (validRoutines.length !== tempSelectedRoutines.length) {
      alert('선택할 수 없는 루틴이 포함되어 있습니다.');
      return;
    }

    // 3. `exercise-log-storage`에 선택 상태 저장
    saveSelectedRoutinesToStorage(validRoutines);

    // 4. 부모 컴포넌트에 선택된 루틴 전달
    onRoutineSelect(validRoutines);
    // 5. 다이얼로그 닫기
    setIsDialogOpen(false);
  };

  /**
   * '루틴 추가하기' 버튼 클릭 시 다이얼로그를 여는 핸들러.
   * 다이얼로그를 열기 전에 로그인 상태와 사용자 루틴 존재 여부를 확인합니다.
   */
  const handleDialogOpen = () => {
    // 1. 로그인 상태 확인
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 2. 사용자 루틴이 하나도 없는지 확인
    if (allUserRoutines.length === 0) {
      alert('먼저 루틴을 생성해주세요.');
      return;
    }

    // 3. 다이얼로그를 열기 전에 현재 선택된 루틴을 임시 상태로 설정
    setTempSelectedRoutines(selectedRoutines);
    // 4. 다이얼로그 열기
    setIsDialogOpen(true);
  };

  return (
    // 오늘의 루틴 카드 컨테이너
    <div className="md:col-span-1 flex flex-col items-center justify-between !bg-blue-600 text-white dark:!bg-blue-700 p-6 shadow-lg rounded-lg transition-all duration-300">
      <HiCheckCircle className="text-white w-10 h-10 mb-2" /> {/* 체크 아이콘 */}
      <h2 className="text-xl font-bold mb-2 text-center">오늘의 루틴</h2> {/* 제목 */}

      {/* 모든 사용자 루틴의 진행률을 표시하는 섹션 */}
      {allUserRoutines.length > 0 ? (
        <div className="w-full mb-4 space-y-2">
          {allUserRoutines.map(routine => {
            const completionRate = routineCompletionData[routine.name] || 0; // 해당 루틴의 완료율
            const isCompleted = todayCompletedRoutines.includes(routine.name); // 오늘 완료된 루틴인지 여부
            // 로컬 스토리지에서 오늘 선택된 루틴인지 확인
            const todayStorageRoutines = getTodaySelectedRoutinesFromStorage();
            const isSelected = todayStorageRoutines.some(r => r.id === routine.id); // 오늘 선택된 루틴인지 여부

            return (
              <div
                key={routine.id}
                className={`bg-white/10 rounded-lg p-3 ${
                  isSelected ? 'ring-2 ring-white/50' : 'opacity-100' // 선택된 루틴이면 테두리 강조
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">
                      {routine.name}
                    </span>
                    {isSelected && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">선택됨</span>} {/* 선택됨 뱃지 */}
                  </div>
                  <span className={`text-xs font-bold ${
                    isCompleted ? 'text-green-300' : // 완료 시 초록색
                    completionRate > 0 ? 'text-yellow-300' : 'text-gray-300' // 진행 중 시 노란색, 아니면 회색
                  }`}>
                    {Math.floor(completionRate)}% {/* 완료율 표시 */}
                    {isCompleted && ' ✅'} {/* 완료 시 체크마크 이모지 */}
                  </span>
                </div>
                {/* 진행률 바 */}
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-green-400' : // 완료 시 초록색 바
                      completionRate > 0 ? 'bg-yellow-400' : 'bg-gray-400' // 진행 중 시 노란색 바, 아니면 회색 바
                    }`}
                    style={{ width: `${Math.floor(completionRate)}%` }} // 완료율에 따른 너비 조절
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // 생성된 루틴이 없을 경우 메시지 표시
        <div className="w-full mb-4 bg-white/10 rounded-lg p-3 text-center">
          <span className="text-sm text-white/70">생성된 루틴이 없습니다</span>
        </div>
      )}

      <div className="flex flex-col space-y-2 w-full">
        {/* 루틴 추가 다이얼로그 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-white !text-blue-600 font-semibold px-6 py-2 rounded-lg shadow cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleDialogOpen} // 다이얼로그 열기 핸들러
            >
              루틴 추가하기 <HiPlus className="w-5 h-5 ml-2" /> {/* + 아이콘 */}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>오늘 수행할 루틴을 선택하세요</DialogTitle> {/* 다이얼로그 제목 */}
            </DialogHeader>
            <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
              {allUserRoutines.length === 0 ? (
                // 다이얼로그 내에서 루틴이 없을 경우 메시지
                <div className="text-center py-4 text-gray-500">
                  <p>생성된 루틴이 없습니다.</p>
                  <p className="text-sm">먼저 루틴을 생성해주세요.</p>
                </div>
              ) : (
                // 모든 사용자 루틴 목록을 매핑하여 표시
                allUserRoutines.map(routine => {
                  const isCompleted = todayCompletedRoutines.includes(routine.name); // 완료 여부
                  const completionRate = routineCompletionData[routine.name] || 0; // 완료율
                  const isSelected = tempSelectedRoutines.some(r => r.id === routine.id); // 임시 선택 여부

                  return (
                    <div
                      key={routine.id}
                      className={`flex items-center space-x-3 p-3 rounded-md hover:bg-secondary cursor-pointer transition-colors ${
                        isCompleted ? 'bg-green-50 border border-green-200' : // 완료 시 초록색 배경/테두리
                        completionRate > 0 ? 'bg-yellow-50 border border-yellow-200' : '' // 진행 중 시 노란색 배경/테두리
                      }`}
                      onClick={() => handleRoutineToggle(routine)} // 클릭 시 루틴 토글
                    >
                      <Checkbox checked={isSelected} /> {/* 체크박스 (선택 여부에 따라 체크됨) */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium ${isCompleted ? 'text-green-700' : completionRate > 0 ? 'text-yellow-700' : ''}`}>
                            {routine.name}
                            {isCompleted && ' ✅'} {/* 완료 시 체크마크 이모지 */}
                          </span>
                          <span className={`text-xs font-bold ${
                            isCompleted ? 'text-green-600' :
                            completionRate > 0 ? 'text-yellow-600' : 'text-gray-400'
                          }`}>
                            {Math.floor(completionRate)}% {/* 완료율 표시 */}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            ({routine.exercises?.length || 0}개 운동) {/* 루틴 내 운동 개수 표시 */}
                          </span>
                          {completionRate > 0 && (
                            // 진행률 바 (진행 중일 때만 표시)
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 ml-2">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  isCompleted ? 'bg-green-500' : 'bg-yellow-500' // 완료/진행 중 색상
                                }`}
                                style={{ width: `${Math.floor(completionRate)}%` }} // 완료율에 따른 너비
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={handleConfirmSelection} // 선택 완료 버튼 클릭 핸들러
                disabled={tempSelectedRoutines.length === 0} // 선택된 루틴이 없으면 버튼 비활성화
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                선택 완료 ({tempSelectedRoutines.length}개 선택) {/* 선택된 루틴 개수 표시 */}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 운동 기록하기 버튼 */}
        <Button
          className="bg-white/20 !text-white font-semibold px-6 py-2 rounded-lg shadow cursor-pointer hover:bg-white/30 transition-colors border border-white/30"
          onClick={() => navigate('/mypage')} // 마이페이지로 이동
        >
          운동 기록하기 <HiPencilAlt className="w-5 h-5 ml-2" /> {/* 연필 아이콘 */}
        </Button>
      </div>
    </div>
  );
};

export default TodayWorkoutCard; // 컴포넌트 내보내기