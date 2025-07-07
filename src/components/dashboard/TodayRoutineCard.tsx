import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { HiCheckCircle, HiPlus, HiPencilAlt } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import type { Routine } from '@/types/index';

interface TodayWorkoutCardProps {
  selectedRoutines: Routine[];
  allUserRoutines: Routine[];
  onRoutineSelect: (routines: Routine[]) => void;
  onStart: () => void;
}

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

  // exercise-log-storage에서 오늘 날짜의 선택된 루틴 불러오기
  const getTodaySelectedRoutinesFromStorage = () => {
    try {
      if (!user?.id) return [];
      
      const logData = localStorage.getItem('exercise-log-storage');
      if (!logData) return [];

      const parsedData = JSON.parse(logData);
      const todayDate = getTodayDateString();
      
      // state.sessions[오늘날짜] 경로로 접근
      const todaySessions = parsedData?.state?.sessions?.[todayDate];
      if (!todaySessions || !Array.isArray(todaySessions)) return [];

      // 오늘 세션에 있는 루틴 ID들 추출
      const routineIds = todaySessions.map((session: any) => session.routineId).filter(Boolean);
      
      // 해당 루틴 ID들과 현재 사용자 루틴들을 매칭
      return allUserRoutines.filter(routine => 
        routineIds.includes(routine.id) && routine.userId === user.id
      );
    } catch (error) {
      console.error('오늘 선택된 루틴 가져오기 실패:', error);
      return [];
    }
  };

  // exercise-log-storage에 선택된 루틴 저장하기 (오늘 날짜 세션으로)
  const saveSelectedRoutinesToStorage = (routines: Routine[]) => {
    try {
      if (!user?.id) return;
      
      const logData = localStorage.getItem('exercise-log-storage');
      const todayDate = getTodayDateString();
      
      let parsedData;
      if (logData) {
        parsedData = JSON.parse(logData);
      } else {
        parsedData = { state: { selectedDate: todayDate, sessions: {}, currentDayMemo: '' }, version: 0 };
      }

      if (!parsedData.state) {
        parsedData.state = { selectedDate: todayDate, sessions: {}, currentDayMemo: '' };
      }
      
      if (!parsedData.state.sessions) {
        parsedData.state.sessions = {};
      }

      // 오늘 날짜의 세션 생성/업데이트
      if (routines.length === 0) {
        // 선택된 루틴이 없으면 오늘 날짜 세션을 빈 배열로 설정
        parsedData.state.sessions[todayDate] = [];
      } else {
        // 선택된 루틴들을 세션 형태로 변환
        const sessionRoutines = routines.map(routine => ({
          logId: null,
          routineId: routine.id,
          routineName: routine.name,
          exercises: routine.exercises.map((ex: any) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            isCompleted: false,
          })),
          completionRate: 0,
        }));
        
        parsedData.state.sessions[todayDate] = sessionRoutines;
      }
      
      localStorage.setItem('exercise-log-storage', JSON.stringify(parsedData));
      console.log('오늘 루틴 선택 저장 완료:', routines.map(r => r.name));
    } catch (error) {
      console.error('루틴 저장 실패:', error);
    }
  };

  // 오늘 날짜 문자열 생성 (YYYY-MM-DD 형식)
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // exercise-log-storage에서 오늘 완료된 루틴 정보 가져오기
  const getRoutineCompletionFromStorage = () => {
    try {
      const logData = localStorage.getItem('exercise-log-storage');
      if (!logData) {
        return { completedRoutines: [], routineCompletionData: {} };
      }

      const parsedData = JSON.parse(logData);
      const todayDate = getTodayDateString();
      
      // state.sessions[오늘날짜] 경로로 접근
      const todaySessions = parsedData?.state?.sessions?.[todayDate];
      if (!todaySessions) {
        return { completedRoutines: [], routineCompletionData: {} };
      }

      const routineCompletionData: { [routineName: string]: number } = {};
      const completedRoutines: string[] = [];

      // 각 세션에서 routineName과 completionRate 확인
      Object.values(todaySessions).forEach((session: any) => {
        if (session && session.routineName) {
          const routineName = session.routineName;
          const completionRate = session.completionRate || 0;
          
          // 루틴별 최대 completionRate 저장
          if (!routineCompletionData[routineName] || routineCompletionData[routineName] < completionRate) {
            routineCompletionData[routineName] = completionRate;
          }
          
          // completionRate가 100인 루틴을 완료된 루틴으로 분류
          if (completionRate === 100 && !completedRoutines.includes(routineName)) {
            completedRoutines.push(routineName);
          }
        }
      });

      return { completedRoutines, routineCompletionData };
    } catch (error) {
      return { completedRoutines: [], routineCompletionData: {} };
    }
  };

  // selectedRoutines가 변경될 때 tempSelectedRoutines 동기화
  useEffect(() => {
    setTempSelectedRoutines(selectedRoutines);
  }, [selectedRoutines]);

  // 컴포넌트 마운트 시 exercise-log-storage에서 오늘 선택된 루틴 복원
  useEffect(() => {
    if (user?.id && allUserRoutines.length > 0) {
      const todayStorageRoutines = getTodaySelectedRoutinesFromStorage();
      if (todayStorageRoutines.length > 0 && selectedRoutines.length === 0) {
        // exercise-log-storage에 오늘 날짜 세션이 있고 현재 선택된 루틴이 없을 때만 복원
        onRoutineSelect(todayStorageRoutines);
      }
    }
  }, [user?.id, allUserRoutines.length]); // onRoutineSelect 의존성 제거하고 길이만 체크

  // 컴포넌트 마운트 시 및 주기적으로 완료된 루틴 확인 + 선택된 루틴 상태 업데이트
  useEffect(() => {
    const updateCompletedRoutines = () => {
      const { completedRoutines, routineCompletionData } = getRoutineCompletionFromStorage();
      setTodayCompletedRoutines(completedRoutines);
      setRoutineCompletionData(routineCompletionData);
      
      // exercise-log-storage에서 오늘 선택된 루틴 확인하여 상태 동기화
      if (user?.id && allUserRoutines.length > 0) {
        const todayStorageRoutines = getTodaySelectedRoutinesFromStorage();
        if (todayStorageRoutines.length > 0 && selectedRoutines.length === 0) {
          onRoutineSelect(todayStorageRoutines);
        }
      }
    };

    updateCompletedRoutines();
    
    // storage 이벤트 리스너 추가 (다른 탭에서의 변경사항 감지)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'exercise-log-storage') {
        updateCompletedRoutines();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 5초마다 확인 (실시간 업데이트를 위해)
    const interval = setInterval(updateCompletedRoutines, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user?.id, allUserRoutines.length, selectedRoutines.length]);

  const handleRoutineToggle = (routine: Routine) => {
    setTempSelectedRoutines(prev => 
      prev.some(r => r.id === routine.id) 
        ? prev.filter(r => r.id !== routine.id)
        : [...prev, routine]
    );
  };

  const handleConfirmSelection = () => {
    // 로그인한 사용자의 루틴만 선택되었는지 확인
    if (!user || !user.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 선택된 루틴이 모두 사용자의 루틴인지 검증
    const validRoutines = tempSelectedRoutines.filter(routine => 
      allUserRoutines.some(userRoutine => 
        userRoutine.id === routine.id && userRoutine.userId === user.id
      )
    );

    if (validRoutines.length !== tempSelectedRoutines.length) {
      alert('선택할 수 없는 루틴이 포함되어 있습니다.');
      return;
    }

    // exercise-log-storage에 선택 상태 저장
    saveSelectedRoutinesToStorage(validRoutines);
    
    onRoutineSelect(validRoutines);
    setIsDialogOpen(false);
  };

  const handleDialogOpen = () => {
    // 로그인 상태 확인
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 사용자의 루틴이 있는지 확인
    if (allUserRoutines.length === 0) {
      alert('먼저 루틴을 생성해주세요.');
      return;
    }

    setTempSelectedRoutines(selectedRoutines);
    setIsDialogOpen(true);
  };

  return (
    <div className="md:col-span-1 flex flex-col items-center justify-between !bg-blue-600 text-white dark:!bg-blue-700 p-6 shadow-lg rounded-lg transition-all duration-300">
      <HiCheckCircle className="text-white w-10 h-10 mb-2" />
      <h2 className="text-xl font-bold mb-2 text-center">오늘의 루틴</h2>
      
      {/* 항상 표시되는 모든 루틴의 진행률 */}
      {allUserRoutines.length > 0 ? (
        <div className="w-full mb-4 space-y-2">
          {allUserRoutines.map(routine => {
            const completionRate = routineCompletionData[routine.name] || 0;
            const isCompleted = todayCompletedRoutines.includes(routine.name);
            // exercise-log-storage에서 오늘 선택된 루틴인지 확인
            const todayStorageRoutines = getTodaySelectedRoutinesFromStorage();
            const isSelected = todayStorageRoutines.some(r => r.id === routine.id);
            
            return (
              <div key={routine.id} className={`bg-white/10 rounded-lg p-3 ${
                isSelected ? 'ring-2 ring-white/50' : 'opacity-100'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">
                      {routine.name}
                    </span>
                    {isSelected && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">선택됨</span>}
                  </div>
                  <span className={`text-xs font-bold ${
                    isCompleted ? 'text-green-300' : 
                    completionRate > 0 ? 'text-yellow-300' : 'text-gray-300'
                  }`}>
                    {Math.floor(completionRate)}%
                    {isCompleted && ' ✅'}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-green-400' : 
                      completionRate > 0 ? 'bg-yellow-400' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.floor(completionRate)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full mb-4 bg-white/10 rounded-lg p-3 text-center">
          <span className="text-sm text-white/70">생성된 루틴이 없습니다</span>
        </div>
      )}
      
      <div className="flex flex-col space-y-2 w-full">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-white !text-blue-600 font-semibold px-6 py-2 rounded-lg shadow cursor-pointer hover:bg-gray-100 transition-colors" 
              onClick={handleDialogOpen}
            >
              루틴 추가하기 <HiPlus className="w-5 h-5 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>오늘 수행할 루틴을 선택하세요</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
            {allUserRoutines.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>생성된 루틴이 없습니다.</p>
                <p className="text-sm">먼저 루틴을 생성해주세요.</p>
              </div>
            ) : (
              allUserRoutines.map(routine => {
                const isCompleted = todayCompletedRoutines.includes(routine.name);
                const completionRate = routineCompletionData[routine.name] || 0;
                const isSelected = tempSelectedRoutines.some(r => r.id === routine.id);
                
                return (
                  <div 
                    key={routine.id} 
                    className={`flex items-center space-x-3 p-3 rounded-md hover:bg-secondary cursor-pointer transition-colors ${
                      isCompleted ? 'bg-green-50 border border-green-200' : completionRate > 0 ? 'bg-yellow-50 border border-yellow-200' : ''
                    }`}
                    onClick={() => handleRoutineToggle(routine)}
                  >
                    <Checkbox checked={isSelected} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${isCompleted ? 'text-green-700' : completionRate > 0 ? 'text-yellow-700' : ''}`}>
                          {routine.name}
                          {isCompleted && ' ✅'}
                        </span>
                        <span className={`text-xs font-bold ${
                          isCompleted ? 'text-green-600' : 
                          completionRate > 0 ? 'text-yellow-600' : 'text-gray-400'
                        }`}>
                          {Math.floor(completionRate)}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          ({routine.exercises?.length || 0}개 운동)
                        </span>
                        {completionRate > 0 && (
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 ml-2">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                isCompleted ? 'bg-green-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.floor(completionRate)}%` }}
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
              onClick={handleConfirmSelection} 
              disabled={tempSelectedRoutines.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              선택 완료 ({tempSelectedRoutines.length}개 선택)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Button 
        className="bg-white/20 !text-white font-semibold px-6 py-2 rounded-lg shadow cursor-pointer hover:bg-white/30 transition-colors border border-white/30" 
        onClick={() => navigate('/mypage')}
      >
        운동 기록하기 <HiPencilAlt className="w-5 h-5 ml-2" />
      </Button>
    </div>
    </div>
  );
};

export default TodayWorkoutCard;