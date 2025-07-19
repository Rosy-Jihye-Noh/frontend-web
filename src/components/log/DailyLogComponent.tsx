import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';
import { useDashboardStore } from '@/store/dashboardStore';
import * as routineApi from '@/services/api/routineApi';
import type { Routine } from '@/types/index';
import { PlusCircle, CheckCircle2, Dumbbell, CalendarPlus, Trash2, Save, PenLine } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const DailyLogComponent = () => {
  const { user } = useUserStore();
  const { todaySelectedRoutines } = useDashboardStore();
  const { 
    selectedDate, 
    currentDayMemo,
    sessions,
    toggleExerciseCheck, 
    addRoutinesToSession,
    updateMemo,
    saveMemo,
    deleteCurrentDayLogs,
    deleteRoutineFromSession
  } = useLogStore();

  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);
  const [selectedRoutines, setSelectedRoutines] = useState<Routine[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memoText, setMemoText] = useState(currentDayMemo);
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const [lastSavedMemo, setLastSavedMemo] = useState(currentDayMemo);

  const isDateFullyCompleted = () => {
    if (!user?.id) return false;
    const allUserLogs = useLogStore.getState().pastLogs.filter(log => 
      log.userId === user.id && log.exerciseDate === selectedDate
    );
    if (allUserLogs.length === 0) return false;
    return allUserLogs.every(log => log.completionRate === 100);
  };

  const sessionRoutines = user?.id ? (sessions[selectedDate] || []).filter(routine => {
    const ownerRoutine = userRoutines.find(r => r.id === routine.routineId);
    return ownerRoutine && ownerRoutine.userId === user.id;
  }) : [];

  useEffect(() => {
    setMemoText(currentDayMemo);
    setLastSavedMemo(currentDayMemo);
  }, [currentDayMemo]);

  useEffect(() => {
    if (user?.id) {
      useLogStore.getState().fetchPastLogs(user.id);
      routineApi.getRoutinesByUser(user.id)
        .then(routines => {
          const userOwnedRoutines = routines.filter(routine => routine.userId === user.id);
          setUserRoutines(userOwnedRoutines);
        })
        .catch(error => {
          console.error('사용자 루틴 로드 실패:', error);
          setUserRoutines([]);
        });
    } else {
      setUserRoutines([]);
    }
  }, [user?.id]);
  
  // (Other useEffect hooks remain the same)
  // ...

  const handleRoutineSelect = (routine: Routine) => {
    if (!user?.id || routine.userId !== user.id) {
      alert('권한이 없습니다.');
      return;
    }
    setSelectedRoutines(prev => 
      prev.some(r => r.id === routine.id) ? prev.filter(r => r.id !== routine.id) : [...prev, routine]
    );
  };

  const handleSessionStart = () => {
    if (user && selectedRoutines.length > 0) {
      const hasInvalidRoutines = selectedRoutines.some(routine => routine.userId !== user.id);
      if (hasInvalidRoutines) {
        alert('권한이 없는 루틴이 포함되어 있습니다.');
        setSelectedRoutines([]);
        return;
      }
      useLogStore.getState().startOrLoadSession(user.id, selectedRoutines);
      setIsDialogOpen(false);
      setSelectedRoutines([]);
    }
  };

  const handleAddRoutines = () => {
    if (user && selectedRoutines.length > 0) {
      const hasInvalidRoutines = selectedRoutines.some(routine => routine.userId !== user.id);
      if (hasInvalidRoutines) {
        alert('권한이 없는 루틴이 포함되어 있습니다.');
        setSelectedRoutines([]);
        return;
      }
      addRoutinesToSession(selectedRoutines);
      setIsDialogOpen(false);
      setSelectedRoutines([]);
    }
  };
  
  const handleMemoSave = async () => {
    if (!user?.id) return;
    setIsSavingMemo(true);
    try {
      updateMemo(memoText);
      await saveMemo(user.id);
      setLastSavedMemo(memoText);
    } catch (error) {
      console.error('메모 저장 실패:', error);
      alert('메모 저장에 실패했습니다.');
    } finally {
      setIsSavingMemo(false);
    }
  };

  const handleDeleteLogs = async () => {
    if (!user?.id || !hasActualLogs()) return;
    try {
      await deleteCurrentDayLogs(user.id);
      setIsDeleteDialogOpen(false);
      setMemoText('');
      setLastSavedMemo('');
    } catch (error) {
      console.error('운동 기록 삭제 실패:', error);
      alert('운동 기록 삭제에 실패했습니다.');
    }
  };

  const handleDeleteRoutine = async (routineId: number) => {
    if (!user?.id) return;
    const currentSession = sessions[selectedDate] || [];
    const targetRoutine = currentSession.find(r => r.routineId === routineId);
    if (!targetRoutine) return;
    const userOwnedRoutine = userRoutines.find(r => r.id === routineId);
    if (!userOwnedRoutine || userOwnedRoutine.userId !== user.id) {
      alert('권한이 없습니다.');
      return;
    }
    const confirmMessage = targetRoutine.logId ? '이 루틴과 관련된 운동 기록이 영구적으로 삭제됩니다. 계속하시겠습니까?' : '이 루틴을 오늘의 운동에서 제거하시겠습니까?';
    if (!window.confirm(confirmMessage)) return;
    try {
      await deleteRoutineFromSession(user.id, routineId);
    } catch (error) {
      console.error('루틴 삭제 실패:', error);
    }
  };

  const hasActualLogs = () => {
    if (!user?.id) return false;
    const allUserLogs = useLogStore.getState().pastLogs.filter(log => log.userId === user.id);
    const uniqueLogForDate = allUserLogs.find(log => log.exerciseDate === selectedDate);
    const hasSessionWithLogId = sessionRoutines.some(routine => routine.logId && routine.logId > 0);
    return !!uniqueLogForDate || hasSessionWithLogId;
  };

  const dateTitle = new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card className="shadow-md rounded-2xl flex-grow flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2 font-bold">
            <Dumbbell className="h-5 w-5 text-blue-500" />
            <span>{dateTitle} 운동</span>
          </CardTitle>
          {isDateFullyCompleted() && (
            <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              완료
            </div>
          )}
          {(sessionRoutines.length > 0 && hasActualLogs()) && (
            <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-neutral-400 hover:text-red-500 hover:bg-red-50 w-8 h-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
          {sessionRoutines.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full m-auto">
              <CalendarPlus className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400 font-medium">오늘의 운동 기록이 없습니다.</p>
              <p className="text-sm text-neutral-400">운동을 시작해볼까요?</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-6 rounded-full font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105">
                    <PlusCircle className="mr-2 h-5 w-5" /> 운동 시작하기
                  </Button>
                </DialogTrigger>
                {/* DialogContent remains largely the same, but with updated button styles */}
                 <DialogContent className="max-w-md rounded-2xl">
                    {/* ... Dialog content styled similarly to below ... */}
                 </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionRoutines.map(routine => (
                <div key={routine.routineId} className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-md flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        {routine.completionRate === 100 
                            ? <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                            : <Dumbbell className="h-5 w-5 text-blue-500" />}
                        {routine.routineName}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRoutine(routine.routineId)} className="w-7 h-7 text-neutral-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </h3>
                  <div className="flex items-center gap-3">
                    <Progress value={routine.completionRate} className="h-2 [&>*]:bg-blue-500" />
                    <span className="text-sm font-semibold w-12 text-right text-blue-500">{Math.round(routine.completionRate)}%</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    {routine.exercises.map(ex => (
                      <div key={ex.exerciseId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-background/80 transition-colors">
                        <Checkbox
                          id={`${routine.routineId}-${ex.exerciseId}`} 
                          checked={ex.isCompleted} 
                          onCheckedChange={() => user && toggleExerciseCheck(user.id, routine.routineId, ex.exerciseId)}
                          className="w-5 h-5 rounded-[4px] border-neutral-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <label htmlFor={`${routine.routineId}-${ex.exerciseId}`} className={`text-sm font-medium transition-colors ${ex.isCompleted ? 'line-through text-neutral-400' : 'text-foreground hover:text-blue-500 cursor-pointer'}`}>
                          {ex.exerciseName}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 border-dashed border-neutral-300 hover:border-blue-500 hover:text-blue-500 text-neutral-500 transition-all">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    수행할 루틴 추가하기
                  </Button>
                </DialogTrigger>
                 {/* DialogContent ... */}
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2 font-bold">
                <PenLine className="h-5 w-5 text-blue-500" />
                <span>운동 메모</span>
            </CardTitle>
            <Button onClick={handleMemoSave} size="sm" disabled={isSavingMemo || memoText === lastSavedMemo} className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:bg-neutral-300 disabled:dark:bg-neutral-700 transition-all">
              <Save className="h-4 w-4 mr-2" />
              {isSavingMemo ? '저장 중...' : '저장'}
            </Button>
        </CardHeader>
        <CardContent className="p-4">
          <Textarea
            placeholder="오늘의 운동 소감이나 컨디션을 기록해보세요."
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            className="min-h-[100px] resize-none border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
          />
           {memoText !== lastSavedMemo && memoText !== '' && (
              <div className="text-xs text-amber-600 mt-2">
                저장되지 않은 변경사항이 있습니다.
              </div>
            )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
                <DialogTitle className="font-bold text-lg">기록 삭제 확인</DialogTitle>
                <DialogDescription className="pt-2">
                    {dateTitle}의 모든 운동 기록과 메모가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-lg">취소</Button>
                <Button onClick={handleDeleteLogs} className="bg-red-600 hover:bg-red-700 text-white rounded-lg">삭제</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyLogComponent;