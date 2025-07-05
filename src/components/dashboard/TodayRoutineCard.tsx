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

  // localStorage에서 선택된 루틴 불러오기
  const getStoredSelectedRoutines = () => {
    try {
      if (!user?.id) return [];
      
      const stored = localStorage.getItem(`selected-routines-${user.id}`);
      if (!stored) return [];
      
      const storedIds: number[] = JSON.parse(stored);
      // 저장된 ID들과 현재 사용자 루틴들을 매칭
      return allUserRoutines.filter(routine => storedIds.includes(routine.id));
    } catch (error) {
      return [];
    }
  };

  // localStorage에 선택된 루틴 저장하기
  const saveSelectedRoutines = (routines: Routine[]) => {
    try {
      if (!user?.id) return;
      
      if (routines.length === 0) {
        // 선택된 루틴이 없으면 localStorage에서 제거
        localStorage.removeItem(`selected-routines-${user.id}`);
      } else {
        const routineIds = routines.map(r => r.id);
        localStorage.setItem(`selected-routines-${user.id}`, JSON.stringify(routineIds));
      }
    } catch (error) {
      // 저장 실패 시 무시
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

  // 컴포넌트 마운트 시 저장된 선택 상태 복원 (새로고침 후에도 유지)
  useEffect(() => {
    if (user?.id && allUserRoutines.length > 0) {
      const storedRoutines = getStoredSelectedRoutines();
      if (storedRoutines.length > 0 && selectedRoutines.length === 0) {
        // 저장된 루틴들이 있고 현재 선택된 루틴이 없을 때만 복원
        onRoutineSelect(storedRoutines);
      }
    }
  }, [user?.id, allUserRoutines.length]); // onRoutineSelect 의존성 제거하고 길이만 체크

  // 컴포넌트 마운트 시 및 주기적으로 완료된 루틴 확인
  useEffect(() => {
    const updateCompletedRoutines = () => {
      const { completedRoutines, routineCompletionData } = getRoutineCompletionFromStorage();
      setTodayCompletedRoutines(completedRoutines);
      setRoutineCompletionData(routineCompletionData);
    };

    updateCompletedRoutines();
    
    // 10초마다 확인 (실시간 업데이트를 위해)
    const interval = setInterval(updateCompletedRoutines, 10000);
    
    return () => clearInterval(interval);
  }, []);

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

    // localStorage에 선택 상태 저장
    saveSelectedRoutines(validRoutines);
    
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
            const isSelected = selectedRoutines.some(r => r.id === routine.id);
            
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