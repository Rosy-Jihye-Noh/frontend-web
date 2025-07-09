import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
// Zustand 스토어
import { useLogStore } from '@/store/logStore'; // 운동기록
import { useUserStore } from '@/store/userStore'; // 사용자 정보
import { useDashboardStore } from '@/store/dashboardStore'; // 대시보드 상태
import * as routineApi from '@/services/api/routineApi';
import type { Routine } from '@/types/index';
import { PlusCircle, CheckCircle2, Dumbbell, CalendarPlus, Trash2, Save } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// DailyLogComponent 함수형 컴포넌트
const DailyLogComponent = () => {
  const { user } = useUserStore();
  const { todaySelectedRoutines } = useDashboardStore();
  const { 
    selectedDate,           // 현재 선택된 날짜 (YYYY-MM-DD 형식)
    currentDayMemo,         // 현재 날짜의 메모
    sessions,               // 날짜별 운동 세션 데이터 (모든 사용자 세션 포함 가능)
    toggleExerciseCheck,    // 운동 완료 여부 토글 함수
    addRoutinesToSession,   // 현재 세션에 루틴 추가 함수
    updateMemo,             // 메모 텍스트 업데이트 함수 (스토어 내부 상태)
    saveMemo,               // 메모를 서버에 저장하는 비동기 함수
    deleteCurrentDayLogs,   // 현재 날짜의 모든 운동 기록 삭제 함수
    deleteRoutineFromSession // 세션에서 특정 루틴 삭제 함수
  } = useLogStore();

  // 컴포넌트 내부 상태 관리
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]); // 현재 로그인된 사용자의 모든 루틴
  const [selectedRoutines, setSelectedRoutines] = useState<Routine[]>([]); // 루틴 추가/시작으로 선택된 루틴
  const [isDialogOpen, setIsDialogOpen] = useState(false); // 루틴 선택 다이얼로그 열림/닫힘 상태
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // 운동 기록 삭제 확인 다이얼로그 열림/닫힘 상태

  const [memoText, setMemoText] = useState(currentDayMemo); // 메모 텍스트 입력 필드의 로컬 상태
  const [isSavingMemo, setIsSavingMemo] = useState(false); // 메모 저장 중인지 여부
  const [lastSavedMemo, setLastSavedMemo] = useState(currentDayMemo); // 마지막으로 저장된 메모 텍스트 (변경사항 감지용)

  /**
   * 현재 선택된 날짜의 모든 운동 로그가 100% 완료되었는지 확인합니다.
   * 사용자의 `pastLogs` 데이터를 기반으로 합니다.
   * @returns {boolean} 모든 로그가 완료되었으면 true, 아니면 false.
   */
  const isDateFullyCompleted = () => {
    if (!user?.id) return false; // 사용자 ID가 없으면 완료되지 않음

    // `pastLogs`에서 현재 사용자의 선택된 날짜에 해당하는 모든 로그를 필터링
    const allUserLogs = useLogStore.getState().pastLogs.filter(log => 
      log.userId === user.id && log.exerciseDate === selectedDate
    );
    
    if (allUserLogs.length === 0) return false; // 해당 날짜에 로그가 없으면 완료되지 않음
    
    // 모든 로그의 `completionRate`가 100%인지 확인
    return allUserLogs.every(log => log.completionRate === 100);
  };

  // 현재 날짜의 세션 루틴을 필터링 - `user`가 소유한 루틴만 포함되도록
  const sessionRoutines = user?.id ? (sessions[selectedDate] || []).filter(routine => {
    const ownerRoutine = userRoutines.find(r => r.id === routine.routineId);
    const isValid = ownerRoutine && ownerRoutine.userId === user.id;
    if (!isValid && routine.routineId) {
      console.warn(`다른 사용자의 세션 루틴 필터링됨: routineId=${routine.routineId}, currentUserId=${user.id}`);
    }
    return isValid;
  }) : [];

  // `currentDayMemo` (Zustand 스토어의 메모)가 변경될 때마다 로컬 `memoText`와 `lastSavedMemo` 상태를 동기화
  useEffect(() => {
    setMemoText(currentDayMemo);
    setLastSavedMemo(currentDayMemo);
  }, [currentDayMemo]);

  // 컴포넌트 마운트 시 (또는 사용자 ID 변경 시) 사용자 루틴과 과거 로그를 불러오는 useEffect
  useEffect(() => {
    if (user?.id) {
      useLogStore.getState().fetchPastLogs(user.id); 
      
      routineApi.getRoutinesByUser(user.id)
        .then(routines => {
          // 서버 응답으로 받은 루틴 중에서 현재 로그인한 사용자의 루틴만 검증하여 필터링
          const userOwnedRoutines = routines.filter(routine => {
            const isValidRoutine = routine.userId === user.id;
            if (!isValidRoutine) {
              console.warn(`잘못된 루틴 필터링됨: routineId=${routine.id}, routineUserId=${routine.userId}, currentUserId=${user.id}`);
            }
            return isValidRoutine;
          });
          
          // 필터링된 루틴 중에서도 혹시 다른 사용자 소유의 루틴이 남아있는지 재확인
          const hasInvalidRoutines = userOwnedRoutines.some(routine => routine.userId !== user.id);
          if (hasInvalidRoutines) {
            console.error('보안 위험: 다른 사용자의 루틴이 포함됨');
            setUserRoutines([]);
            return;
          }
          
          // 현재 로그 스토어의 pastLogs에서 중복을 제거한 운동 기록 개수를 로깅 (디버깅용)
          const currentLogs = useLogStore.getState().pastLogs.filter(log => log.userId === user.id);
          const uniqueLogsByDate = new Map<string, any>();
          currentLogs.forEach(log => {
            const existingLog = uniqueLogsByDate.get(log.exerciseDate);
            // 동일 날짜에 여러 로그가 있을 경우, 가장 최근에 생성된(또는 수정된) 로그를 선택
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
      console.log('로그인되지 않은 상태, 데이터 초기화');
      setUserRoutines([]);
    }
  }, [user?.id]);

  // 선택된 날짜 또는 사용자 ID가 변경될 때마다 해당 날짜의 세션 정보를 로드하는 useEffect
  useEffect(() => {
    if (user?.id && selectedDate) {
      routineApi.getRoutinesByUser(user.id).then(allUserRoutines => {
        const allSessionsForSelectedDate = useLogStore.getState().sessions[selectedDate] || [];
        // 현재 로그인한 사용자의 루틴 ID에 해당하는 세션만 필터링
        const currentUserSessions = allSessionsForSelectedDate.filter(session => {
          return allUserRoutines.some(routine => 
            routine.id === session.routineId && routine.userId === user.id
          );
        });
        
        // 현재 사용자의 세션이 없는 경우 `pastLogs`에서 로그를 가져옵니다
        if (currentUserSessions.length === 0) {
          const allUserLogs = useLogStore.getState().pastLogs.filter(log => log.userId === user.id);
          
          // 중복 제거: 동일 날짜의 로그 중 최신 것만 선택합니다.
          const uniqueLogsByDate = new Map<string, any>();
          allUserLogs.forEach(log => {
            const existingLog = uniqueLogsByDate.get(log.exerciseDate);
            if (!existingLog || new Date(log.createdAt || log.exerciseDate) > new Date(existingLog.createdAt || existingLog.exerciseDate)) {
              uniqueLogsByDate.set(log.exerciseDate, log);
            }
          });
          
          const pastLog = uniqueLogsByDate.get(selectedDate);
          
          // 과거 로그가 존재
          if (pastLog && pastLog.routineIds && pastLog.routineIds.length > 0) {
            // 현재 사용자가 소유한 루틴인지 다시 확인
            const userOwnedRoutinesInLog = allUserRoutines.filter(routine => {
              const isValid = routine.userId === user.id;
              if (!isValid) {
                console.error(`보안 위험: 다른 사용자의 루틴 감지 - routineId=${routine.id}, routineUserId=${routine.userId}, currentUserId=${user.id}`);
              }
              return isValid;
            });
            
            if (userOwnedRoutinesInLog.length !== allUserRoutines.length) {
              console.error('보안 검증 실패: 세션 복원 중단');
              return;
            }
            
            const routinesForThisLog = userOwnedRoutinesInLog.filter(routine => 
              pastLog.routineIds.includes(routine.id)
            );
            
            if (routinesForThisLog.length > 0) {
              console.log(`${selectedDate} 세션 복원 (보안 검증 후): ${routinesForThisLog.map(r => r.name).join(', ')}`);
              useLogStore.getState().startOrLoadSession(user.id, routinesForThisLog);
            } else {
              console.log(`${selectedDate}: 복원할 루틴이 없음 (로그에 기록된 루틴: ${pastLog.routineIds.join(', ')})`);
            }
          } else { // 과거 로그가 존재하지 않음
            console.log(`${selectedDate}: 복원할 과거 로그가 없음`);
          }
        } else { // 현재 사용자의 세션이 존재
          console.log(`${selectedDate}: 현재 사용자의 세션 이미 존재 (${currentUserSessions.length}개)`);
        }
      }).catch(error => {
        console.error('루틴 데이터 로드 실패로 세션 복원 중단:', error);
      });
    }
  }, [selectedDate, user?.id]);

  // 대시보드에서 선택된 루틴이 있고, 오늘 날짜이며, 현재 사용자 세션이 아직 없으면 자동으로 세션을 시작하는 useEffect
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (
      user?.id && 
      todaySelectedRoutines.length > 0 && 
      selectedDate === today && 
      sessionRoutines.length === 0 
    ) {
      console.log('대시보드에서 자동 세션 시작:', todaySelectedRoutines.map(r => r.name));
      useLogStore.getState().startOrLoadSession(user.id, todaySelectedRoutines);
    }
  }, [user?.id, todaySelectedRoutines, selectedDate]);

  // 루틴 선택 다이얼로그에서 루틴 체크박스 토글 시 호출되는 핸들러
  const handleRoutineSelect = (routine: Routine) => {
    // 선택하려는 루틴이 현재 로그인한 사용자의 소유인지 확인
    if (!user?.id || routine.userId !== user.id) {
      console.error(`보안 위험: 다른 사용자의 루틴 선택 시도 - routineId=${routine.id}, routineUserId=${routine.userId}, currentUserId=${user?.id}`);
      alert('권한이 없습니다.');
      return;
    }
    
    // `tempSelectedRoutines` 상태를 업데이트 (이미 선택되었으면 제거, 아니면 추가)
    setSelectedRoutines(prev => 
      prev.some(r => r.id === routine.id) ? prev.filter(r => r.id !== routine.id) : [...prev, routine]
    );
  };

  // '선택한 루틴으로 시작' 버튼 클릭 시 호출되는 핸들러 (새로운 세션을 시작)
  const handleSessionStart = () => {
    if (user && selectedRoutines.length > 0) { 
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

  // '수행할 루틴 추가' 버튼 클릭 시 호출되는 핸들러 (기존 세션에 루틴 추가)
  const handleAddRoutines = () => {
    if (selectedRoutines.length > 0) { 
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
      addRoutinesToSession(selectedRoutines); 
      setIsDialogOpen(false);
      setSelectedRoutines([]);
    }
  };
  
  // 메모 저장 버튼 클릭 시 호출되는 비동기 핸들러
  const handleMemoSave = async () => {
    if (!user?.id) return;
    
    setIsSavingMemo(true);
    try {
      console.log('메모 저장 시도:', memoText);
      updateMemo(memoText); // 메모 텍스트를 LogStore에 업데이트
      await saveMemo(user.id); // LogStore의 saveMemo 함수 호출
      setLastSavedMemo(memoText); // 마지막으로 저장된 메모 텍스트 업데이트
      console.log('메모 저장 성공');
    } catch (error) {
      console.error('메모 저장 실패:', error);
      alert('메모 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSavingMemo(false);
    }
  };

  // 현재 날짜의 운동 기록 삭제 확인 다이얼로그에서 '삭제' 버튼 클릭 시 호출되는 비동기 핸들러
  const handleDeleteLogs = async () => {
    if (!user?.id) return;
    
    if (!hasActualLogs()) {
      alert('삭제할 운동 기록이 없습니다.');
      setIsDeleteDialogOpen(false);
      return;
    }
    
    try {
      await deleteCurrentDayLogs(user.id);
      setIsDeleteDialogOpen(false);
      setMemoText('');
      setLastSavedMemo('');
    } catch (error) {
      console.error('운동 기록 삭제 실패:', error);
      alert('운동 기록 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 특정 루틴을 세션에서 삭제하는 비동기 핸들러
  const handleDeleteRoutine = async (routineId: number) => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    const currentSession = sessions[selectedDate] || [];
    const targetRoutine = currentSession.find(r => r.routineId === routineId);
    
    if (!targetRoutine) {
      console.warn('삭제할 루틴을 찾을 수 없습니다:', routineId);
      alert('삭제할 루틴을 찾을 수 없습니다.');
      return;
    }

    const userOwnedRoutine = userRoutines.find(r => r.id === routineId);
    if (!userOwnedRoutine || userOwnedRoutine.userId !== user.id) {
      console.error(`보안 위험: 다른 사용자의 루틴 삭제 시도 - routineId=${routineId}, userId=${user.id}`);
      alert('권한이 없습니다.');
      return;
    }

    // 삭제 확인 메시지 표시
    const confirmMessage = targetRoutine.logId 
      ? '이 루틴과 관련된 운동 기록이 영구적으로 삭제됩니다. 계속하시겠습니까?'
      : '이 루틴을 오늘의 운동에서 제거하시겠습니까?';

    if (!window.confirm(confirmMessage)) {
      return; // 사용자가 취소하면 함수 종료
    }
    
    try {
      console.log('루틴 삭제 시도 (보안 검증 후):', { routineId, logId: targetRoutine.logId, date: selectedDate, userId: user.id });
      await deleteRoutineFromSession(user.id, routineId); // LogStore의 `deleteRoutineFromSession` 함수 호출
    } catch (error) {
      console.error('루틴 삭제 실패:', error);
    }
  };

  // 현재 선택된 날짜를 한국어 형식으로 포맷하여 카드 제목에 표시
  const dateTitle = new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  /**
   * 현재 선택된 날짜에 실제 저장된(pastLogs에 존재하는) 운동 기록이 있는지 또는
   * 현재 세션에 logId가 할당된 루틴(즉, 이미 저장된 로그와 연결된)이 있는지 확인합니다.
   * 이는 '기록 삭제' 버튼의 활성화 여부를 결정하는 데 사용됩니다.
   * @returns {boolean} 실제 로그가 존재하면 true, 아니면 false.
   */
  const hasActualLogs = () => {
    if (!user?.id) return false;

    const allUserLogs = useLogStore.getState().pastLogs.filter(log => log.userId === user.id);
    
    // 중복 제거: 동일 날짜의 로그 중 최신 것만 선택
    const uniqueLogsByDate = new Map<string, any>();
    allUserLogs.forEach(log => {
      const existingLog = uniqueLogsByDate.get(log.exerciseDate);
      if (!existingLog || new Date(log.createdAt || log.exerciseDate) > new Date(existingLog.createdAt || existingLog.exerciseDate)) {
        uniqueLogsByDate.set(log.exerciseDate, log);
      }
    });
    
    const uniqueLogForDate = uniqueLogsByDate.get(selectedDate); // 선택된 날짜의 고유한 최신 로그
    
    // 루틴이 있는지 확인
    const hasSessionWithLogId = sessionRoutines.some(routine => 
      routine.logId && routine.logId > 0
    );
    
    // 고유한 과거 로그가 있거나, 현재 세션에 저장된 로그와 연결된 루틴이 있다면 true 반환
    return !!uniqueLogForDate || hasSessionWithLogId;
  };

  // 사용자 로그인/로그아웃 또는 사용자 변경 시 세션을 안전하게 초기화하는 useEffect
  useEffect(() => {
    const currentUserId = user?.id;
    const storedUserId = sessionStorage.getItem('lastLoggedUserId');
    
    if (currentUserId) { // 현재 사용자가 로그인 상태인 경우
      // 이전에 로그인된 사용자가 있고, 그 사용자가 현재 사용자와 다르면 사용자 변경 감지
      if (storedUserId && storedUserId !== currentUserId.toString()) {
        console.log('사용자 변경 감지, 세션 초기화:', storedUserId, '->', currentUserId);
        const { sessions, selectedDate } = useLogStore.getState();
        if (sessions[selectedDate]?.length > 0) {
          useLogStore.getState().clearSessionRoutines();
        }
        
        // 이전 사용자 ID로 로컬 스토리지에 저장된 세션 상태 데이터도 정리
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`session_${storedUserId}_`)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key)); // 로컬 스토리지에서 삭제
        console.log(`이전 사용자(${storedUserId})의 세션 상태 정리:`, keysToRemove.length, '개');
      }
      // 현재 로그인된 사용자 ID를 세션 스토리지에 저장
      sessionStorage.setItem('lastLoggedUserId', currentUserId.toString());
    } else { 
      if (storedUserId) { // 이전에 로그인된 사용자가 있었다면
        console.log('사용자 로그아웃 감지, 세션 초기화');
        sessionStorage.removeItem('lastLoggedUserId'); // 세션 스토리지에서 마지막 로그인 사용자 ID 제거
        const { sessions, selectedDate } = useLogStore.getState();
        if (sessions[selectedDate]?.length > 0) {
          useLogStore.getState().clearSessionRoutines();
        }
      }
    }
  }, [user?.id]);

  return (
    <div className="space-y-4 w-full">
      {/* 오늘의 운동 기록 카드 */}
      <Card className="shadow-sm w-full border-l-4 "> {/* 카드 그림자, 전체 너비, 왼쪽 테두리 스타일 */}
        <CardHeader className="flex flex-row items-center justify-between "> {/* 카드 헤더: 가로 정렬, 요소 간 공간 분배 */}
          <CardTitle className="text-lg flex items-center gap-2"> {/* 카드 제목: 글자 크기, 아이템 중앙 정렬, 간격 */}
            <div className="p-2 bg-blue-100 rounded-full">
              <Dumbbell className="h-5 w-5 text-blue-600" /> {/* 아령 아이콘 */}
            </div>
            <span className="text-gray-800 dark:text-gray-200">{dateTitle} 운동</span> {/* 선택된 날짜와 '운동' 텍스트 */}
            {/* 날짜의 모든 운동이 100% 완료되었을 경우 '완료' 뱃지 표시 */}
            {isDateFullyCompleted() && (
              <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> {/* 체크 완료 아이콘 */}
                완료
              </div>
            )}
          </CardTitle>
          {/* 세션 루틴이 존재하고 실제 기록이 있을 경우에만 '기록 삭제' 버튼 표시 */}
          {(sessionRoutines.length > 0 && hasActualLogs()) && (
            <Button
              variant="outline" // 외곽선 버튼 스타일
              size="sm" // 작은 크기 버튼
              onClick={() => setIsDeleteDialogOpen(true)} // 클릭 시 삭제 확인 다이얼로그 열기
              className="text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50 transition-all duration-200" // 버튼 스타일링
            >
              <Trash2 className="h-4 w-4 mr-1" /> {/* 쓰레기통 아이콘 */}
              <span className="hidden sm:inline">기록 삭제</span> {/* 작은 화면에서는 숨김 */}
              <span className="sm:hidden">삭제</span> {/* 작은 화면에서만 표시 */}
            </Button>
          )}
        </CardHeader>
        <CardContent className="min-h-[200px]"> {/* 카드 내용: 최소 높이 설정 */}
          {/* 현재 날짜의 세션 루틴이 없을 경우 '운동 시작하기' 화면 표시 */}
          {sessionRoutines.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <CalendarPlus className="h-16 w-16 text-blue-400" /> {/* 달력에 플러스 아이콘 */}
              </div>
              <p className="text-muted-foreground">오늘의 운동을 시작해보세요.</p>
              {/* 루틴 선택 및 시작 다이얼로그 */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild> {/* 버튼을 트리거로 사용 */}
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <PlusCircle className="mr-2 h-4 w-4" /> 운동 시작하기
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md"> {/* 다이얼로그 내용 */}
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <PlusCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      수행할 루틴을 선택하세요
                    </DialogTitle>
                    <DialogDescription>
                      오늘 수행할 운동 루틴을 선택해서 운동을 시작하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto"> {/* 스크롤 가능한 루틴 목록 */}
                    {userRoutines.map(routine => (
                      <div 
                        key={routine.id} 
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200" 
                        onClick={() => handleRoutineSelect(routine)} // 루틴 선택 핸들러 호출
                      >
                        <Checkbox 
                          checked={selectedRoutines.some(r => r.id === routine.id)} // 선택 여부 확인
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" // 체크박스 스타일
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{routine.name}</span>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleSessionStart} // 세션 시작 핸들러 호출
                      disabled={selectedRoutines.length === 0} // 선택된 루틴이 없으면 비활성화
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      선택한 루틴으로 시작 ({selectedRoutines.length}개)
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            // 세션 루틴이 존재할 경우, 루틴 목록과 운동 진행 상황 표시
            <div className="space-y-6">
              {sessionRoutines.map(routine => (
                <div key={routine.routineId} className="bg-card rounded-lg p-4 border border-blue-100 shadow-sm">
                  <h3 className="font-semibold text-md mb-3 flex items-center gap-2">
                    {/* 루틴 완료 여부에 따른 아이콘 표시 */}
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
                    {/* 루틴 삭제 버튼 */}
                    <Button
                      variant="ghost" // 투명 버튼 스타일
                      size="sm" // 작은 크기
                      onClick={() => handleDeleteRoutine(routine.routineId)} // 루틴 삭제 핸들러 호출
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" /> {/* 쓰레기통 아이콘 */}
                    </Button>
                  </h3>
                  {/* 루틴 완료율 프로그레스 바 */}
                  <div className="flex items-center gap-3 mb-4">
                    <Progress
                      value={routine.completionRate} // 현재 완료율
                      className="h-3 rounded-full bg-blue-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600 shadow-inner" // 프로그레스 바 스타일
                    />
                    <span className="text-sm font-bold w-12 text-right text-blue-600">{Math.round(routine.completionRate)}%</span>
                  </div>
                  {/* 각 운동 목록과 체크박스 */}
                  <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                    {routine.exercises.map(ex => (
                      <div key={ex.exerciseId} className="flex items-center space-x-3 p-2 rounded-md hover:bg-blue-50 transition-colors duration-200">
                        <Checkbox 
                          id={`${routine.routineId}-${ex.exerciseId}`} // 고유 ID
                          checked={ex.isCompleted} // 운동 완료 여부
                          onCheckedChange={(checked) => {
                            if (user) { // 사용자 로그인 여부 확인
                              // 보안 검증: 현재 사용자가 이 루틴의 소유자인지 확인
                              const ownerRoutine = userRoutines.find(r => r.id === routine.routineId);
                              if (!ownerRoutine || ownerRoutine.userId !== user.id) {
                                console.error(`보안 위험: 다른 사용자의 운동 기록 수정 시도 - routineId=${routine.routineId}, userId=${user.id}`);
                                alert('권한이 없습니다.');
                                return;
                              }
                              console.log('체크박스 변경 (보안 검증 후):', routine.routineId, ex.exerciseId, checked);
                              toggleExerciseCheck(user.id, routine.routineId, ex.exerciseId); // 운동 완료 상태 토글
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
              {/* 기존 세션에 루틴 추가 버튼 (다이얼로그 트리거) */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 border-dashed border-blue-300 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-300 transition-all duration-200">
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
                    <DialogDescription>
                      현재 운동에 추가할 루틴을 선택하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
                    {/* 현재 세션에 없는 루틴만 필터링하여 표시 */}
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
                          <span className="font-medium text-gray-700 dark:text-gray-300">{routine.name}</span>
                        </div>
                      ))}
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddRoutines} // 루틴 추가 핸들러 호출
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

      {/* 운동 메모 카드 - 항상 표시 */}
      <Card className="shadow-sm w-full border-l-4 ">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Save className="h-4 w-4 text-blue-600" /> {/* 저장 아이콘 */}
              </div>
              <span className="text-gray-800 dark:text-gray-200">운동 메모</span>
            </div>
            {/* 메모 저장 버튼 */}
            <Button
              onClick={handleMemoSave} // 메모 저장 핸들러 호출
              size="sm"
              disabled={isSavingMemo || memoText === lastSavedMemo} // 저장 중이거나 변경사항이 없으면 비활성화
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
              console.log('메모 텍스트 변경:', e.target.value); // 디버깅용 로그
              setMemoText(e.target.value); // 메모 텍스트 상태 업데이트
            }}
            className="min-h-[120px] resize-none border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
          {memoText && ( // 메모 텍스트가 있을 경우에만 정보 표시
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-blue-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                작성된 메모: {memoText.length}자
              </div>
              {memoText !== lastSavedMemo && ( // 마지막 저장된 메모와 다르면 '저장되지 않은 변경사항' 표시
                <div className="text-xs text-amber-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  저장되지 않은 변경사항
                </div>
              )}
              {memoText === lastSavedMemo && lastSavedMemo && ( // 메모가 저장되었고 내용이 있을 경우 '저장됨' 표시
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  저장됨
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 운동 기록 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-800">
              운동 기록 삭제
            </DialogTitle>
            <DialogDescription>
              선택한 날짜의 모든 운동 기록과 메모를 영구적으로 삭제합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg border border-border">
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
              onClick={() => setIsDeleteDialogOpen(false)} // 취소 버튼 클릭 시 다이얼로그 닫기
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              취소
            </Button>
            <Button 
              onClick={handleDeleteLogs} // 삭제 버튼 클릭 시 `handleDeleteLogs` 함수 호출
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

export default DailyLogComponent; // 컴포넌트 내보내기