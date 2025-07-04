import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';
import { useDashboardStore } from '@/store/dashboardStore';
import * as routineApi from '@/services/api/routineApi';
import type { Routine } from '@/types/index';
import { PlusCircle, CheckCircle2, Dumbbell, CalendarPlus, Trash2, Save, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const DailyLogComponent = () => {
  const { user } = useUserStore();
  const { todaySelectedRoutines } = useDashboardStore();
  const { 
    selectedDate, 
    currentDayMemo,
    sessions,
    startOrLoadSession, 
    toggleExerciseCheck, 
    addRoutinesToSession,
    updateMemo,
    saveMemo,
    deleteCurrentDayLogs,
    deleteRoutineFromSession,
    fetchPastLogs
  } = useLogStore();
  
  // sessions 실시간 업데이트
  const sessionRoutines = sessions[selectedDate] || [];

  useEffect(() => {
    console.log('SessionRoutines 변화:', sessionRoutines.length, selectedDate);
  }, [sessionRoutines, selectedDate]);

  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);
  const [selectedRoutines, setSelectedRoutines] = useState<Routine[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memoText, setMemoText] = useState(currentDayMemo);
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const [lastSavedMemo, setLastSavedMemo] = useState(currentDayMemo);

  // 메모 텍스트 동기화
  useEffect(() => {
    setMemoText(currentDayMemo);
    setLastSavedMemo(currentDayMemo);
  }, [currentDayMemo]);

  // 실시간 상태 동기화를 위한 useEffect 추가
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = useLogStore.getState();
      const currentSessionRoutines = currentState.sessions[selectedDate] || [];
      const currentMemo = currentState.currentDayMemo;
      
      if (JSON.stringify(sessionRoutines) !== JSON.stringify(currentSessionRoutines)) {
        console.log('세션 상태 동기화');
      }
      
      if (currentMemo !== memoText && currentMemo !== '') {
        setMemoText(currentMemo);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedDate, sessionRoutines, memoText]);

  useEffect(() => {
    if (user?.id) {
      // 로그인한 사용자의 과거 로그를 가져와서 메모도 함께 로드
      console.log('사용자', user.id, '의 운동 기록 로드 시작');
      fetchPastLogs(user.id);
      routineApi.getRoutinesByUser(user.id)
        .then(routines => {
          // 해당 사용자의 루틴만 필터링
          const userOwnedRoutines = routines.filter(routine => routine.userId === user.id);
          console.log('로그인한 사용자의 루틴 로드:', userOwnedRoutines.length, '개');
          setUserRoutines(userOwnedRoutines);
        })
        .catch(error => {
          console.error('사용자 루틴 로드 실패:', error);
          setUserRoutines([]);
        });
    } else {
      // 로그인하지 않은 경우 초기화
      console.log('로그인되지 않은 상태, 데이터 초기화');
      setUserRoutines([]);
    }
  }, [user, fetchPastLogs]);

  // 날짜가 변경될 때마다 로그인한 사용자의 해당 날짜 세션 정보 다시 로드
  useEffect(() => {
    if (user?.id && selectedDate) {
      const sessionExists = useLogStore.getState().sessions[selectedDate];
      if (!sessionExists || sessionExists.length === 0) {
        // 해당 날짜의 기존 로그가 있는지 확인하고 세션 복원 (로그인한 사용자만)
        const pastLog = useLogStore.getState().pastLogs.find(log => 
          log.exerciseDate === selectedDate && log.userId === user.id
        );
        if (pastLog && pastLog.routineIds && pastLog.routineIds.length > 0) {
          // 기존 로그에서 루틴 정보를 가져와서 세션 복원 (사용자 소유 루틴만)
          routineApi.getRoutinesByUser(user.id).then(allRoutines => {
            const userOwnedRoutines = allRoutines.filter(routine => routine.userId === user.id);
            const routinesForThisLog = userOwnedRoutines.filter(routine => 
              pastLog.routineIds.includes(routine.id)
            );
            if (routinesForThisLog.length > 0) {
              console.log('사용자', user.id, '의 세션 복원:', routinesForThisLog.map(r => r.name));
              startOrLoadSession(user.id, routinesForThisLog);
            }
          });
        }
      }
    }
  }, [selectedDate, user, startOrLoadSession]);

  // 대시보드에서 선택한 루틴이 있고, 오늘 날짜이고, 아직 세션이 없으면 자동 시작
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (
      user?.id && 
      todaySelectedRoutines.length > 0 && 
      selectedDate === today && 
      sessionRoutines.length === 0
    ) {
      startOrLoadSession(user.id, todaySelectedRoutines);
    }
  }, [user, todaySelectedRoutines, selectedDate, sessionRoutines.length, startOrLoadSession]);

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
  
  const handleMemoSave = async () => {
    if (!user?.id) return;
    
    setIsSavingMemo(true);
    try {
      console.log('메모 저장 시도:', memoText);
      // 스토어에 메모 업데이트 후 저장
      updateMemo(memoText);
      await saveMemo(user.id);
      setLastSavedMemo(memoText);
      console.log('메모 저장 성공');
    } catch (error) {
      console.error('메모 저장 실패:', error);
      alert('메모 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSavingMemo(false);
    }
  };

  const handleDeleteLogs = async () => {
    if (!user?.id) return;
    
    try {
      await deleteCurrentDayLogs(user.id);
      setIsDeleteDialogOpen(false);
      // 삭제 후 메모 텍스트도 초기화
      setMemoText('');
      setLastSavedMemo('');
    } catch (error) {
      console.error('운동 기록 삭제 실패:', error);
      alert('운동 기록 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteRoutine = async (routineId: number) => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 삭제할 루틴이 현재 세션에 있는지 확인
    const currentSession = sessions[selectedDate] || [];
    const targetRoutine = currentSession.find(r => r.routineId === routineId);
    
    if (!targetRoutine) {
      console.warn('삭제할 루틴을 찾을 수 없습니다:', routineId);
      alert('삭제할 루틴을 찾을 수 없습니다.');
      return;
    }

    const confirmMessage = targetRoutine.logId 
      ? '이 루틴과 관련된 운동 기록이 영구적으로 삭제됩니다. 계속하시겠습니까?'
      : '이 루틴을 오늘의 운동에서 제거하시겠습니까?';

    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      console.log('루틴 삭제 시도:', { routineId, logId: targetRoutine.logId, date: selectedDate });
      await deleteRoutineFromSession(user.id, routineId);
    } catch (error) {
      console.error('루틴 삭제 실패:', error);
      // 사용자에게는 이미 store에서 처리된 메시지가 표시됨
    }
  };

  const dateTitle = new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  return (
    <div className="space-y-4 w-full">
      <Card className="shadow-sm w-full border-l-4 ">
        <CardHeader className="flex flex-row items-center justify-between ">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Dumbbell className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-gray-800">{dateTitle} 운동</span>
          </CardTitle>
          {sessionRoutines.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">기록 삭제</span>
              <span className="sm:hidden">삭제</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="min-h-[200px]">
          {/* ▼▼▼ 100% 완료 시 특별 화면을 보여주는 로직을 제거하고, 세션 유무만 확인 ▼▼▼ */}
          {sessionRoutines.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <CalendarPlus className="h-16 w-16 text-blue-400" />
              </div>
              <p className="text-muted-foreground">오늘의 운동을 시작해보세요.</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <PlusCircle className="mr-2 h-4 w-4" /> 운동 시작하기
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <PlusCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      수행할 루틴을 선택하세요
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
                    {userRoutines.map(routine => (
                      <div 
                        key={routine.id} 
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200" 
                        onClick={() => handleRoutineSelect(routine)}
                      >
                        <Checkbox 
                          checked={selectedRoutines.some(r => r.id === routine.id)} 
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <span className="font-medium text-gray-700">{routine.name}</span>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleSessionStart} 
                      disabled={selectedRoutines.length === 0} 
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      선택한 루틴으로 시작 ({selectedRoutines.length}개)
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-6">
              {sessionRoutines.map(routine => (
                <div key={routine.routineId} className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                  <h3 className="font-semibold text-md mb-3 flex items-center gap-2">
                    {routine.completionRate === 100 ? (
                      <div className="p-1 bg-emerald-100 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="p-1 bg-blue-100 rounded-full">
                        <Dumbbell className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <span className="text-gray-800">{routine.routineName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRoutine(routine.routineId)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Progress
                      value={routine.completionRate}
                      className="h-3 rounded-full bg-blue-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600 shadow-inner"
                    />
                    <span className="text-sm font-bold w-12 text-right text-blue-600">{Math.round(routine.completionRate)}%</span>
                  </div>
                  <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                    {routine.exercises.map(ex => (
                      <div key={ex.exerciseId} className="flex items-center space-x-3 p-2 rounded-md hover:bg-blue-50 transition-colors duration-200">
                        <Checkbox 
                          id={`${routine.routineId}-${ex.exerciseId}`} 
                          checked={ex.isCompleted} 
                          onCheckedChange={(checked) => {
                            if (user) {
                              console.log('체크박스 변경:', routine.routineId, ex.exerciseId, checked);
                              toggleExerciseCheck(user.id, routine.routineId, ex.exerciseId);
                            }
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <label htmlFor={`${routine.routineId}-${ex.exerciseId}`} className={`text-sm font-medium leading-none cursor-pointer transition-all duration-200 ${ex.isCompleted ? 'line-through text-muted-foreground' : 'text-gray-700 hover:text-blue-600'}`}>
                          {ex.exerciseName}
                        </label>
                      
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    수행할 루틴 추가하기
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <PlusCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      추가할 루틴을 선택하세요
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
                    {userRoutines
                      .filter(ur => !sessionRoutines.some(sr => sr.routineId === ur.id))
                      .map(routine => (
                        <div 
                          key={routine.id} 
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200" 
                          onClick={() => handleRoutineSelect(routine)}
                        >
                          <Checkbox 
                            checked={selectedRoutines.some(r => r.id === routine.id)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <span className="font-medium text-gray-700">{routine.name}</span>
                        </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddRoutines} 
                      disabled={selectedRoutines.length === 0} 
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      선택한 루틴 추가 ({selectedRoutines.length}개)
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 메모 카드 - 항상 표시 */}
      <Card className="shadow-sm w-full border-l-4 ">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Save className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-gray-800">운동 메모</span>
            </div>
            <Button
              onClick={handleMemoSave}
              size="sm"
              disabled={isSavingMemo || memoText === lastSavedMemo}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              <Save className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{isSavingMemo ? '저장 중...' : '저장'}</span>
              <span className="sm:hidden">{isSavingMemo ? '...' : '저장'}</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea
            placeholder="오늘의 운동에 대한 메모를 작성해보세요..."
            value={memoText}
            onChange={(e) => {
              console.log('메모 텍스트 변경:', e.target.value);
              setMemoText(e.target.value);
            }}
            className="min-h-[120px] resize-none border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
          {memoText && (
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-blue-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                작성된 메모: {memoText.length}자
              </div>
              {memoText !== lastSavedMemo && (
                <div className="text-xs text-amber-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  저장되지 않은 변경사항
                </div>
              )}
              {memoText === lastSavedMemo && lastSavedMemo && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  저장됨
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-800">
              운동 기록 삭제
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-800 font-medium">
                {dateTitle}의 모든 운동 기록과 메모가 삭제됩니다.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              취소
            </Button>
            <Button 
              onClick={handleDeleteLogs}
              className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyLogComponent;