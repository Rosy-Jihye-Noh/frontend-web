import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { HiCheckCircle, HiPlus, HiPencilAlt, HiArrowRight } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import type { Routine } from '@/types/index';

// TodayWorkoutCard 컴포넌트의 props 인터페이스 (원본 유지)
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

  const getTodaySelectedRoutinesFromStorage = () => {
    try {
      if (!user?.id) return [];
      const logData = localStorage.getItem('exercise-log-storage');
      if (!logData) return [];
      const parsedData = JSON.parse(logData);
      const todayDate = getTodayDateString();
      const todaySessions = parsedData?.state?.sessions?.[todayDate];
      if (!todaySessions || !Array.isArray(todaySessions)) return [];
      const routineIds = todaySessions.map((session: any) => session.routineId).filter(Boolean);
      return allUserRoutines.filter(routine =>
        routineIds.includes(routine.id) && routine.userId === user.id
      );
    } catch (error) {
      console.error('오늘 선택된 루틴 가져오기 실패:', error);
      return [];
    }
  };

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
      if (routines.length === 0) {
        parsedData.state.sessions[todayDate] = [];
      } else {
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
    } catch (error) {
      console.error('루틴 저장 실패:', error);
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getRoutineCompletionFromStorage = () => {
    try {
      const logData = localStorage.getItem('exercise-log-storage');
      if (!logData) return { completedRoutines: [], routineCompletionData: {} };
      const parsedData = JSON.parse(logData);
      const todayDate = getTodayDateString();
      const todaySessions = parsedData?.state?.sessions?.[todayDate];
      if (!todaySessions) return { completedRoutines: [], routineCompletionData: {} };
      const routineCompletionData: { [routineName: string]: number } = {};
      const completedRoutines: string[] = [];
      Object.values(todaySessions).forEach((session: any) => {
        if (session && session.routineName) {
          const routineName = session.routineName;
          const completionRate = session.completionRate || 0;
          if (!routineCompletionData[routineName] || routineCompletionData[routineName] < completionRate) {
            routineCompletionData[routineName] = completionRate;
          }
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

  useEffect(() => {
    setTempSelectedRoutines(selectedRoutines);
  }, [selectedRoutines]);

  useEffect(() => {
    if (user?.id && allUserRoutines.length > 0) {
      const todayStorageRoutines = getTodaySelectedRoutinesFromStorage();
      if (todayStorageRoutines.length > 0 && selectedRoutines.length === 0) {
        onRoutineSelect(todayStorageRoutines);
      }
    }
  }, [user?.id, allUserRoutines.length, onRoutineSelect]);

  useEffect(() => {
    const updateCompletedRoutines = () => {
      const { completedRoutines, routineCompletionData } = getRoutineCompletionFromStorage();
      setTodayCompletedRoutines(completedRoutines);
      setRoutineCompletionData(routineCompletionData);
      if (user?.id && allUserRoutines.length > 0) {
        const todayStorageRoutines = getTodaySelectedRoutinesFromStorage();
        if (todayStorageRoutines.length > 0 && selectedRoutines.length === 0) {
          onRoutineSelect(todayStorageRoutines);
        }
      }
    };
    updateCompletedRoutines();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'exercise-log-storage') {
        updateCompletedRoutines();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(updateCompletedRoutines, 5000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user?.id, allUserRoutines.length, selectedRoutines.length, onRoutineSelect]);

  const handleRoutineToggle = (routine: Routine) => {
    setTempSelectedRoutines(prev =>
      prev.some(r => r.id === routine.id)
        ? prev.filter(r => r.id !== routine.id)
        : [...prev, routine]
    );
  };

  const handleConfirmSelection = () => {
    if (!user || !user.id) {
      alert('로그인이 필요합니다.');
      return;
    }
    const validRoutines = tempSelectedRoutines.filter(routine =>
      allUserRoutines.some(userRoutine =>
        userRoutine.id === routine.id && userRoutine.userId === user.id
      )
    );
    if (validRoutines.length !== tempSelectedRoutines.length) {
      alert('선택할 수 없는 루틴이 포함되어 있습니다.');
      return;
    }
    saveSelectedRoutinesToStorage(validRoutines);
    onRoutineSelect(validRoutines);
    setIsDialogOpen(false);
  };

  const handleDialogOpen = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (allUserRoutines.length === 0) {
      alert('먼저 루틴을 생성해주세요.');
      navigate('/routines/new');
      return;
    }
    setTempSelectedRoutines(selectedRoutines);
    setIsDialogOpen(true);
  };

  const todayStorageRoutines = getTodaySelectedRoutinesFromStorage();

  return (
    <div className="md:col-span-1 flex flex-col bg-gradient-to-br from-[#5A8FD6] to-[#2C4A66] text-white rounded-2xl p-6 shadow-lg transition-all duration-300">
      <div className='flex-shrink-0'>
        <HiCheckCircle className="text-white w-10 h-10 mb-2" />
        <h2 className="text-xl font-bold mb-4 text-left">오늘의 루틴</h2>
      </div>

      <div className="flex-grow w-full mb-4 space-y-2 overflow-y-auto pr-1">
        {allUserRoutines.length > 0 ? (
            allUserRoutines.map(routine => {
              const completionRate = routineCompletionData[routine.name] || 0;
              const isCompleted = todayCompletedRoutines.includes(routine.name);
              // 미리 계산된 todayStorageRoutines를 사용하여 isSelected를 확인합니다.
              const isSelected = todayStorageRoutines.some(r => r.id === routine.id);
              
              return (
                <div key={routine.id} className={`bg-white/10 rounded-lg p-3 transition-all duration-300 ${
                  isSelected ? 'opacity-100 ring-2 ring-white/60' : 'opacity-60 hover:opacity-80'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {routine.name}
                      </span>
                      {isSelected && <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full font-semibold">선택됨</span>}
                    </div>
                    <span className={`text-xs font-bold ${
                      isCompleted ? 'text-green-300' : 
                      completionRate > 0 ? 'text-yellow-300' : 'text-gray-300'
                    }`}>
                      {Math.floor(completionRate)}%
                      {isCompleted && ' ✅'}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-400' : 
                        completionRate > 0 ? 'bg-yellow-400' : 'bg-transparent'
                      }`}
                      style={{ width: `${Math.floor(completionRate)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-black/10 rounded-xl p-4 text-center">
            <span className="text-sm text-white/70">생성된 루틴이 없습니다</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col space-y-2 w-full flex-shrink-0 pt-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-white text-[#007AFF] font-bold py-3 rounded-lg shadow-md transition-transform active:scale-95 w-full"
              onClick={handleDialogOpen}
            >
              루틴 추가하기 <HiPlus className="w-5 h-5 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-background text-foreground border-border rounded-2xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">오늘 수행할 루틴을 선택하세요</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
              {allUserRoutines.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
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
                      className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                      onClick={() => handleRoutineToggle(routine)}
                    >
                      <Checkbox checked={isSelected} id={`dialog-item-${routine.id}`} className="data-[state=checked]:bg-[#007AFF] data-[state=checked]:border-[#007AFF]" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor={`dialog-item-${routine.id}`} className={`font-semibold cursor-pointer ${isCompleted ? 'text-green-600' : ''}`}>
                            {routine.name}
                            {isCompleted && ' ✅'}
                          </label>
                          <span className={`text-xs font-bold ${
                            isCompleted ? 'text-green-600' : 
                            completionRate > 0 ? 'text-yellow-600' : 'text-muted-foreground'
                          }`}>
                            {Math.floor(completionRate)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            ({routine.exercises?.length || 0}개 운동)
                          </span>
                          {completionRate > 0 && (
                            <div className="flex-1 bg-muted rounded-full h-1.5 ml-2">
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
                disabled={tempSelectedRoutines.length === 0 && selectedRoutines.length === 0}
                className="bg-[#007AFF] hover:bg-[#0056b3] text-white font-bold w-full py-3 rounded-lg"
              >
                선택 완료 ({tempSelectedRoutines.length}개 선택)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button 
          className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-lg w-full group"
          onClick={() => navigate('/mypage')}
        >
          운동 기록하기 <HiArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default TodayWorkoutCard;