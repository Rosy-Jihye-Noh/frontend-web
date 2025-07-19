import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { HiOutlinePencil, HiCheckCircle, HiArrowRight, HiOutlineDocumentText } from 'react-icons/hi';
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
      console.log('오늘 루틴 선택 저장 완료:', routines.map(r => r.name));
    } catch (error) {
      console.error('루틴 저장 실패:', error);
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getRoutineCompletionFromStorage = () => {
    try {
      const logData = localStorage.getItem('exercise-log-storage');
      if (!logData) {
        return { completedRoutines: [], routineCompletionData: {} };
      }
      const parsedData = JSON.parse(logData);
      const todayDate = getTodayDateString();
      const todaySessions = parsedData?.state?.sessions?.[todayDate];
      if (!todaySessions) {
        return { completedRoutines: [], routineCompletionData: {} };
      }
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
  }, [user?.id, allUserRoutines.length]);

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
  }, [user?.id, allUserRoutines.length, selectedRoutines.length]);

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

  return (
    <div className="md:col-span-1 flex flex-col bg-gradient-to-br from-[#5A8FD6] to-[#2C4A66] text-white rounded-2xl p-6 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">오늘의 루틴</h2>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate('/mypage')}>
          <HiOutlinePencil className="w-6 h-6" />
        </Button>
      </div>

      {selectedRoutines.length > 0 ? (
        <div className="w-full space-y-3 flex-grow">
          {selectedRoutines.map(routine => {
            const completionRate = Math.floor(routineCompletionData[routine.name] || 0);
            return (
              <div key={routine.id} className="bg-white/10 rounded-lg p-3 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold truncate">{routine.name}</span>
                  <span className={`text-sm font-bold ${completionRate === 100 ? 'text-green-300' : 'text-yellow-300'}`}>
                    {completionRate}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${completionRate}%`,
                      background: completionRate === 100 ? '#4ade80' : '#facc15'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center bg-black/10 rounded-xl p-4 my-4 text-center">
            {allUserRoutines.length > 0 ? (
                <>
                    <HiCheckCircle className="w-10 h-10 text-white/50 mb-2" />
                    <p className="text-sm text-white/70">오늘 할 루틴을 선택해주세요.</p>
                </>
            ) : (
                <>
                    <HiOutlineDocumentText className="w-10 h-10 text-white/50 mb-2" />
                    <p className="text-sm text-white/70">아직 생성된 루틴이 없네요.</p>
                    <Button onClick={() => navigate('/routines/new')} variant="link" className="text-white/90 h-auto p-0 mt-1">
                        지금 만들러 가기
                    </Button>
                </>
            )}
        </div>
      )}

      <div className="flex flex-col space-y-2 mt-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-white text-[#007AFF] font-bold py-3 rounded-lg shadow-md transition-transform active:scale-95 w-full"
              onClick={handleDialogOpen}
            >
              오늘의 루틴 선택하기
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-background text-foreground border-border rounded-2xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">오늘 운동할 루틴을 선택하세요</DialogTitle>
              <DialogDescription>수행할 운동 루틴을 선택할 수 있습니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[50vh] overflow-y-auto">
              {allUserRoutines.map(routine => {
                const isSelected = tempSelectedRoutines.some(r => r.id === routine.id);
                return (
                  <div
                    key={routine.id}
                    className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                    onClick={() => handleRoutineToggle(routine)}
                  >
                    <Checkbox checked={isSelected} id={`routine-${routine.id}`} className="rounded-sm" />
                    <label htmlFor={`routine-${routine.id}`} className="flex-1 cursor-pointer">
                      <p className="font-semibold">{routine.name}</p>
                      <p className="text-sm text-muted-foreground">{routine.exercises?.length || 0}개 운동</p>
                    </label>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button
                onClick={handleConfirmSelection}
                className="bg-[#007AFF] hover:bg-[#0056b3] text-white font-bold w-full py-3 rounded-lg transition-transform active:scale-95"
              >
                선택 완료 ({tempSelectedRoutines.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          className="bg-white/20 text-white font-semibold py-3 rounded-lg shadow-md transition-transform active:scale-95 w-full group"
          onClick={() => navigate('/mypage')}
        >
          운동 기록 보러가기 <HiArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default TodayWorkoutCard;