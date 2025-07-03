// src/components/log/DailyLogComponent.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';
import * as routineApi from '@/services/api/routineApi';
import type { Routine } from '@/types/index';
import { PlusCircle, CheckCircle2, Dumbbell, CalendarPlus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const getProgressColorClass = (rate: number): string => {
    if (rate === 100) return 'bg-emerald-500';
    return 'bg-primary';
};

const DailyLogComponent = () => {
  const { user } = useUserStore();
  const { 
    selectedDate, 
    startOrLoadSession, 
    toggleExerciseCheck, 
    addRoutinesToSession 
  } = useLogStore();
  
  const sessionRoutines = React.useMemo(
    () => useLogStore.getState().sessions[selectedDate] || [], 
    [useLogStore.getState().sessions, selectedDate]
  );

  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);
  const [selectedRoutines, setSelectedRoutines] = useState<Routine[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      routineApi.getRoutinesByUser(user.id).then(setUserRoutines);
    }
  }, [user]);

  const handleRoutineSelect = (routine: Routine) => {
    setSelectedRoutines(prev => 
      prev.some(r => r.id === routine.id) ? prev.filter(r => r.id !== routine.id) : [...prev, routine]
    );
  };

  const handleSessionStart = () => {
    if (user && selectedRoutines.length > 0) {
      startOrLoadSession(user.id, selectedRoutines);
      setIsDialogOpen(false);
      setSelectedRoutines([]);
    }
  };

  const handleAddRoutines = () => {
    if (selectedRoutines.length > 0) {
      addRoutinesToSession(selectedRoutines);
      setIsDialogOpen(false);
      setSelectedRoutines([]);
    }
  };
  
  const dateTitle = new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  return (
    <Card className="shadow-sm w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          <span>{dateTitle} 운동</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[200px]">
        {/* ▼▼▼ 100% 완료 시 특별 화면을 보여주는 로직을 제거하고, 세션 유무만 확인 ▼▼▼ */}
        {sessionRoutines.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center gap-4">
            <CalendarPlus className="h-16 w-16 text-slate-400" />
            <p className="text-muted-foreground">오늘의 운동을 시작해보세요.</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger 
              className="bg-blue-600 hover:bg-blue-700 text-white"asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> 운동 시작하기</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>수행할 루틴을 선택하세요</DialogTitle></DialogHeader>
                <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
                  {userRoutines.map(routine => (
                    <div key={routine.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary cursor-pointer" onClick={() => handleRoutineSelect(routine)}>
                      <Checkbox checked={selectedRoutines.some(r => r.id === routine.id)} />
                      <span className="font-medium">{routine.name}</span>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button onClick={handleSessionStart} disabled={selectedRoutines.length === 0}>
                    선택한 루틴으로 시작 ({selectedRoutines.length}개)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-6">
            {sessionRoutines.map(routine => (
              <div key={routine.routineId}>
                <h3 className="font-semibold text-md mb-2 flex items-center gap-2">
                  {routine.completionRate === 100 && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  <span>{routine.routineName}</span>
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <Progress
                    value={routine.completionRate}
                    className="h-3 rounded-full bg-blue-100 [&>div]:bg-blue-600"
                  />
                  <span className="text-sm font-bold w-12 text-right">{Math.round(routine.completionRate)}%</span>
                </div>
                <div className="space-y-3 pl-2 border-l-2">
                  {routine.exercises.map(ex => (
                    <div key={ex.exerciseId} className="flex items-center space-x-3">
                      <Checkbox id={`${routine.routineId}-${ex.exerciseId}`} checked={ex.isCompleted} onCheckedChange={() => user && toggleExerciseCheck(user.id, routine.routineId, ex.exerciseId)} />
                      <label htmlFor={`${routine.routineId}-${ex.exerciseId}`} className={`text-sm font-medium leading-none cursor-pointer ${ex.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {ex.exerciseName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-4 border-dashed">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  수행할 루틴 추가하기
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>추가할 루틴을 선택하세요</DialogTitle></DialogHeader>
                <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
                  {userRoutines
                    .filter(ur => !sessionRoutines.some(sr => sr.routineId === ur.id))
                    .map(routine => (
                      <div key={routine.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary cursor-pointer" onClick={() => handleRoutineSelect(routine)}>
                        <Checkbox checked={selectedRoutines.some(r => r.id === routine.id)} />
                        <span className="font-medium">{routine.name}</span>
                      </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button onClick={handleAddRoutines} disabled={selectedRoutines.length === 0}>
                    선택한 루틴 추가 ({selectedRoutines.length}개)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyLogComponent;