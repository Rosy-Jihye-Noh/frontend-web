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

  /**
   * 현재 선택된 날짜의 모든 운동 로그가 100% 완료되었는지 확인합니다.
   * 사용자의 `pastLogs` 데이터를 기반으로 합니다.
   * @returns {boolean} 모든 로그가 완료되었으면 true, 아니면 false.
   */
  const isDateFullyCompleted = () => {
    if (!user?.id) return false;
    
    // pastLogs에서 해당 사용자의 선택된 날짜 로그들 가져오기
    const allUserLogs = useLogStore.getState().pastLogs.filter(log => 
      log.userId === user.id && log.exerciseDate === selectedDate
    );
    
    // 로그가 없으면 완료 아님
    if (allUserLogs.length === 0) return false;
    
    // 모든 로그가 100% 완료인지 확인
    return allUserLogs.every(log => log.completionRate === 100);
  };

  // sessions 실시간 업데이트 - 현재 사용자의 세션만 필터링
  const sessionRoutines = user?.id ? (sessions[selectedDate] || []).filter(routine => {
    // 세션의 루틴이 현재 로그인한 사용자의 루틴인지 확인
    const ownerRoutine = userRoutines.find(r => r.id === routine.routineId);
    const isValid = ownerRoutine && ownerRoutine.userId === user.id;
    if (!isValid && routine.routineId) {
      console.warn(`다른 사용자의 세션 루틴 필터링됨: routineId=${routine.routineId}, currentUserId=${user.id}`);
    }
    return isValid;
  }) : [];

  // 메모 텍스트 동기화
  useEffect(() => {
    setMemoText(currentDayMemo);
    setLastSavedMemo(currentDayMemo);
  }, [currentDayMemo]);

  useEffect(() => {
    if (user?.id) {
      // 로그인한 사용자의 과거 로그를 가져와서 메모도 함께 로드 (중복 호출 방지)
      useLogStore.getState().fetchPastLogs(user.id);
      
      routineApi.getRoutinesByUser(user.id)
        .then(routines => {
          // 서버 응답을 강력하게 검증: 사용자 ID가 일치하는 루틴만 허용
          const userOwnedRoutines = routines.filter(routine => {
            const isValidRoutine = routine.userId === user.id;
            if (!isValidRoutine) {
              console.warn(`잘못된 루틴 필터링됨: routineId=${routine.id}, routineUserId=${routine.userId}, currentUserId=${user.id}`);
            }
            return isValidRoutine;
          });
          
          // 보안 검증: 모든 루틴이 현재 사용자 소유인지 재확인
          const hasInvalidRoutines = userOwnedRoutines.some(routine => routine.userId !== user.id);
          if (hasInvalidRoutines) {
            console.error('보안 위험: 다른 사용자의 루틴이 포함됨');
            setUserRoutines([]);
            return;
          }
          
          // 현재 로그스토어에서 중복 제거된 로그 정보도 함께 표시
          const currentLogs = useLogStore.getState().pastLogs.filter(log => log.userId === user.id);
          const uniqueLogsByDate = new Map<string, any>();
          currentLogs.forEach(log => {
            const existingLog = uniqueLogsByDate.get(log.exerciseDate);
            if (!existingLog || new Date(log.createdAt || log.exerciseDate) > new Date(existingLog.createdAt || existingLog.exerciseDate)) {
              uniqueLogsByDate.set(log.exerciseDate, log);
            }
          });
          const uniqueLogsCount = uniqueLogsByDate.size;
          
          console.log(`사용자 ${user.id}: 검증된 루틴 ${userOwnedRoutines.length}개, 운동기록 ${uniqueLogsCount}개 (중복제거 후)`);
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
  }, [user?.id]); // fetchPastLogs 의존성 제거

  // 날짜가 변경될 때마다 로그인한 사용자의 해당 날짜 세션 정보 다시 로드
  useEffect(() => {
    if (user?.id && selectedDate) {
      // 더 안전한 방법: 실제 사용자 루틴을 확인한 후 세션 복원 여부 결정
      routineApi.getRoutinesByUser(user.id).then(allUserRoutines => {
        // 현재 사용자의 세션만 확인
        const allSessions = useLogStore.getState().sessions[selectedDate] || [];
        const userSessions = allSessions.filter(session => {
          return allUserRoutines.some(routine => 
            routine.id === session.routineId && routine.userId === user.id
          );
        });
        
        if (userSessions.length === 0) {
          // 현재 사용자의 세션이 없는 경우에만 세션 복원 시도
          const allUserLogs = useLogStore.getState().pastLogs.filter(log => log.userId === user.id);
        
        // 중복 제거: 동일 날짜의 로그 중 최신 것만 선택
        const uniqueLogsByDate = new Map<string, any>();
        allUserLogs.forEach(log => {
          const existingLog = uniqueLogsByDate.get(log.exerciseDate);
          if (!existingLog || new Date(log.createdAt || log.exerciseDate) > new Date(existingLog.createdAt || existingLog.exerciseDate)) {
            uniqueLogsByDate.set(log.exerciseDate, log);
          }
        });
        
        const pastLog = uniqueLogsByDate.get(selectedDate);
        
        if (pastLog && pastLog.routineIds && pastLog.routineIds.length > 0) {
          // 보안 검증: 서버에서 받은 모든 루틴이 현재 사용자 소유인지 확인
          const userOwnedRoutines = allUserRoutines.filter(routine => {
            const isValid = routine.userId === user.id;
            if (!isValid) {
              console.error(`보안 위험: 다른 사용자의 루틴 감지 - routineId=${routine.id}, routineUserId=${routine.userId}, currentUserId=${user.id}`);
            }
            return isValid;
          });
          
          // 보안 검증 실패시 세션 복원 중단
          if (userOwnedRoutines.length !== allUserRoutines.length) {
            console.error('보안 검증 실패: 세션 복원 중단');
            return;
          }
          
          // 로그에 포함된 루틴 ID 중에서 현재 사용자 소유 루틴만 필터링
          const routinesForThisLog = userOwnedRoutines.filter(routine => 
            pastLog.routineIds.includes(routine.id)
          );
          
          if (routinesForThisLog.length > 0) {
            console.log(`${selectedDate} 세션 복원 (보안 검증 후): ${routinesForThisLog.map(r => r.name).join(', ')}`);
            useLogStore.getState().startOrLoadSession(user.id, routinesForThisLog);
          } else {
            console.log(`${selectedDate}: 복원할 루틴이 없음 (로그에 기록된 루틴: ${pastLog.routineIds.join(', ')})`);
          }
        } else {
          console.log(`${selectedDate}: 복원할 과거 로그가 없음`);
        }
      } else {
        console.log(`${selectedDate}: 현재 사용자의 세션 이미 존재 (${userSessions.length}개)`);
      }
      }).catch(error => {
        console.error('루틴 데이터 로드 실패로 세션 복원 중단:', error);
      });
    }
  }, [selectedDate, user?.id]); // startOrLoadSession 의존성 제거

  // 대시보드에서 선택한 루틴이 있고, 오늘 날짜이고, 아직 현재 사용자의 세션이 없으면 자동 시작
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (
      user?.id && 
      todaySelectedRoutines.length > 0 && 
      selectedDate === today && 
      sessionRoutines.length === 0 // 이미 필터링된 사용자 세션이므로 안전
    ) {
      console.log('대시보드에서 자동 세션 시작:', todaySelectedRoutines.map(r => r.name));
      useLogStore.getState().startOrLoadSession(user.id, todaySelectedRoutines);
    }
  }, [user?.id, todaySelectedRoutines, selectedDate]); // sessionRoutines는 실시간 계산되므로 의존성에서 제거

  const handleRoutineSelect = (routine: Routine) => {
    // 보안 검증: 선택하려는 루틴이 현재 사용자의 소유인지 확인
    if (!user?.id || routine.userId !== user.id) {
      console.error(`보안 위험: 다른 사용자의 루틴 선택 시도 - routineId=${routine.id}, routineUserId=${routine.userId}, currentUserId=${user?.id}`);
      alert('권한이 없습니다.');
      return;
    }
    
    setSelectedRoutines(prev => 
      prev.some(r => r.id === routine.id) ? prev.filter(r => r.id !== routine.id) : [...prev, routine]
    );
  };

  const handleSessionStart = () => {
    if (user && selectedRoutines.length > 0) {
      // 보안 검증: 선택된 모든 루틴이 현재 사용자 소유인지 재확인
      const hasInvalidRoutines = selectedRoutines.some(routine => routine.userId !== user.id);
      if (hasInvalidRoutines) {
        console.error('보안 위험: 다른 사용자의 루틴으로 세션 시작 시도');
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
    if (selectedRoutines.length > 0) {
      // 보안 검증: 추가하려는 모든 루틴이 현재 사용자 소유인지 재확인
      if (!user?.id) {
        alert('로그인이 필요합니다.');
        return;
      }
      
      const hasInvalidRoutines = selectedRoutines.some(routine => routine.userId !== user.id);
      if (hasInvalidRoutines) {
        console.error('보안 위험: 다른 사용자의 루틴 추가 시도');
        alert('권한이 없는 루틴이 포함되어 있습니다.');
        setSelectedRoutines([]);
        return;
      }
      
      console.log('루틴 추가 (보안 검증 후):', selectedRoutines.map(r => r.name));
      addRoutinesToSession(user.id, selectedRoutines);
      setIsDialogOpen(false);
      setSelectedRoutines([]);
    }
  };
  
  const handleMemoSave = async () => {
    if (!user?.id) return;
    
    setIsSavingMemo(true);
    try {
      console.log('메모 저장 시도:', memoText);
      console.log('현재 날짜:', selectedDate);
      
      // 스토어에 메모 업데이트 후 저장
      updateMemo(memoText);
      await saveMemo(user.id);
      setLastSavedMemo(memoText);
      console.log('메모 저장 성공');
    } catch (error) {
      console.error('메모 저장 실패:', error);
      // 더 구체적인 에러 메시지 표시
      if (error instanceof Error) {
        alert(`메모 저장에 실패했습니다: ${error.message}`);
      } else {
        alert('메모 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSavingMemo(false);
    }
  };

  const handleDeleteLogs = async () => {
    if (!user?.id) return;
    
    // 실제 삭제할 로그가 있는지 다시 한번 확인
    if (!hasActualLogs()) {
      alert('삭제할 운동 기록이 없습니다.');
      setIsDeleteDialogOpen(false);
      return;
    }
    
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

    // 보안 검증: 삭제하려는 루틴이 현재 사용자 소유인지 확인
    const userOwnedRoutine = userRoutines.find(r => r.id === routineId);
    if (!userOwnedRoutine || userOwnedRoutine.userId !== user.id) {
      console.error(`보안 위험: 다른 사용자의 루틴 삭제 시도 - routineId=${routineId}, userId=${user.id}`);
      alert('권한이 없습니다.');
      return;
    }

    const confirmMessage = targetRoutine.logId 
      ? '이 루틴과 관련된 운동 기록이 영구적으로 삭제됩니다. 계속하시겠습니까?'
      : '이 루틴을 오늘의 운동에서 제거하시겠습니까?';

    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      console.log('루틴 삭제 시도 (보안 검증 후):', { routineId, logId: targetRoutine.logId, date: selectedDate, userId: user.id });
      await deleteRoutineFromSession(user.id, routineId);
    } catch (error) {
      console.error('루틴 삭제 실패:', error);
      // 사용자에게는 이미 store에서 처리된 메시지가 표시됨
    }
  };

  const dateTitle = new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  /**
   * 현재 선택된 날짜에 실제 저장된(pastLogs에 존재하는) 운동 기록이 있는지 또는
   * 현재 세션에 logId가 할당된 루틴(즉, 이미 저장된 로그와 연결된)이 있는지 확인합니다.
   * 이는 '기록 삭제' 버튼의 활성화 여부를 결정하는 데 사용됩니다.
   * @returns {boolean} 실제 로그가 존재하면 true, 아니면 false.
   */
  const hasActualLogs = () => {
    if (!user?.id) return false;
    
    // pastLogs에서 해당 사용자의 모든 로그 가져오기
    const allUserLogs = useLogStore.getState().pastLogs.filter(log => log.userId === user.id);
    
    // 중복 제거: 동일 날짜의 로그 중 최신 것만 선택 (검증된 루틴과 동일한 로직)
    const uniqueLogsByDate = new Map<string, any>();
    allUserLogs.forEach(log => {
      const existingLog = uniqueLogsByDate.get(log.exerciseDate);
      if (!existingLog || new Date(log.createdAt || log.exerciseDate) > new Date(existingLog.createdAt || existingLog.exerciseDate)) {
        uniqueLogsByDate.set(log.exerciseDate, log);
      }
    });
    
    // 해당 날짜의 unique한 로그가 있는지 확인
    const uniqueLogForDate = uniqueLogsByDate.get(selectedDate);
    
    // 세션에서 실제 logId가 있는 루틴이 있는지 확인
    const hasSessionWithLogId = sessionRoutines.some(routine => 
      routine.logId && routine.logId > 0
    );
    
    return !!uniqueLogForDate || hasSessionWithLogId;
  };

  // 사용자 변경 감지 시 안전하게 세션 초기화
  useEffect(() => {
    const currentUserId = user?.id;
    const storedUserId = sessionStorage.getItem('lastLoggedUserId');
    
    if (currentUserId) {
      // 새로운 사용자 로그인 또는 사용자 변경 감지
      if (storedUserId && storedUserId !== currentUserId.toString()) {
        console.log('사용자 변경 감지, 세션 초기화:', storedUserId, '->', currentUserId);
        // 이전 사용자의 세션 데이터 정리
        const { sessions, selectedDate } = useLogStore.getState();
        if (sessions[selectedDate]?.length > 0) {
          useLogStore.getState().clearSessionRoutines();
        }
        
        // 이전 사용자의 localStorage 세션 상태 정리
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`session_${storedUserId}_`)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`이전 사용자(${storedUserId})의 세션 상태 정리:`, keysToRemove.length, '개');
      }
      sessionStorage.setItem('lastLoggedUserId', currentUserId.toString());
    } else {
      // 사용자 로그아웃
      if (storedUserId) {
        console.log('사용자 로그아웃 감지, 세션 초기화');
        sessionStorage.removeItem('lastLoggedUserId');
        const { sessions, selectedDate } = useLogStore.getState();
        if (sessions[selectedDate]?.length > 0) {
          useLogStore.getState().clearSessionRoutines();
        }
      }
    }
  }, [user?.id]);
  // --- 원본 로직 끝 ---

  return (
    // --- 새로운 UI 시작 ---
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
                <DialogContent className="max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>수행할 루틴 선택</DialogTitle>
                    <DialogDescription>
                      오늘 수행할 운동 루틴을 선택하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
                    {userRoutines.map(routine => (
                      <div 
                        key={routine.id} 
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer" 
                        onClick={() => handleRoutineSelect(routine)}
                      >
                        <Checkbox 
                          checked={selectedRoutines.some(r => r.id === routine.id)} 
                          onCheckedChange={() => handleRoutineSelect(routine)}
                          className="data-[state=checked]:bg-blue-500"
                        />
                        <span className="font-medium text-foreground">{routine.name}</span>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleSessionStart} 
                      disabled={selectedRoutines.length === 0} 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      선택한 루틴으로 시작 ({selectedRoutines.length}개)
                    </Button>
                  </DialogFooter>
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
                <DialogContent className="max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>추가할 루틴 선택</DialogTitle>
                    <DialogDescription>
                      현재 운동에 추가할 루틴을 선택하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
                    {userRoutines
                      .filter(ur => !sessionRoutines.some(sr => sr.routineId === ur.id))
                      .map(routine => (
                        <div 
                          key={routine.id} 
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer" 
                          onClick={() => handleRoutineSelect(routine)}
                        >
                          <Checkbox 
                            checked={selectedRoutines.some(r => r.id === routine.id)}
                            onCheckedChange={() => handleRoutineSelect(routine)}
                            className="data-[state=checked]:bg-blue-500"
                          />
                          <span className="font-medium text-foreground">{routine.name}</span>
                        </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddRoutines} 
                      disabled={selectedRoutines.length === 0} 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
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
    // --- 새로운 UI 끝 ---
  );
};

export default DailyLogComponent;
