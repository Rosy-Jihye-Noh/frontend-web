// src/store/logStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import * as exerciseLogApi from '@/services/api/exerciseLogApi';
import type { Routine, RoutineExercise, ExerciseLog } from '@/types/index';

// --- Type Definitions ---
interface SessionExercise {
  exerciseId: number;
  exerciseName: string;
  isCompleted: boolean;
}
interface SessionRoutine {
  logId: number | null;
  routineId: number;
  routineName: string;
  exercises: SessionExercise[];
  completionRate: number;
  userId: number;
}
interface LogSessionState {
  selectedDate: string;
  sessions: Record<string, SessionRoutine[]>; 
  pastLogs: ExerciseLog[];
  currentDayMemo: string;
  isLoading: boolean;
  fetchPastLogs: (userId: number) => Promise<void>;
  setSelectedDate: (date: string) => void;
  startOrLoadSession: (userId: number, routines: Routine[]) => Promise<void>;
  addRoutinesToSession: (userId: number, routines: Routine[]) => void;
  toggleExerciseCheck: (userId: number, routineId: number, exerciseId: number) => Promise<void>;
  clearSessionRoutines: () => void;
  updateMemo: (memo: string) => void;
  saveMemo: (userId: number) => Promise<void>;
  deleteCurrentDayLogs: (userId: number) => Promise<void>;
  deleteRoutineFromSession: (userId: number, routineId: number) => Promise<void>;
}

export const useLogStore = create<LogSessionState>()(
  persist(
    (set, get) => ({
      selectedDate: new Date().toISOString().split('T')[0],
      sessions: {},
      pastLogs: [] as ExerciseLog[],
      currentDayMemo: '',
      isLoading: false,

      /**
       * 특정 사용자의 과거 운동 기록을 서버에서 불러와 상태를 업데이트합니다.
       * @param userId - 과거 기록을 불러올 사용자의 ID
       */
      fetchPastLogs: async (userId) => {
        if (!userId) {
          set({ pastLogs: [], currentDayMemo: '' });
          return;
        }
        
        try {
          const logs = await exerciseLogApi.getLogsByUser(userId);
          
          // 사용자 ID로 한번 더 필터링 (보안 강화)
          const filteredLogs = logs?.filter(log => log.userId === userId) || [];
          
          // 날짜별로 unique한 로그만 유지 (가장 최근 로그 우선)
          const uniqueLogsByDate = filteredLogs.reduce((acc, log) => {
            const existingLogIndex = acc.findIndex(existingLog => existingLog.exerciseDate === log.exerciseDate);
            if (existingLogIndex === -1) {
              // 해당 날짜의 첫 번째 로그
              acc.push(log);
            } else {
              // 해당 날짜에 이미 로그가 있는 경우, ID가 더 큰(최신) 로그로 대체
              if (log.id && acc[existingLogIndex].id && log.id > acc[existingLogIndex].id) {
                acc[existingLogIndex] = log;
              }
            }
            return acc;
          }, [] as ExerciseLog[]);
          
          const { selectedDate } = get();
          
          // 선택된 날짜의 메모 로드 (해당 사용자의 것만)
          const todaysLog = uniqueLogsByDate.find(log => 
            log.exerciseDate === selectedDate && log.userId === userId
          );
          const memo = todaysLog?.memo || '';
          
          set({ pastLogs: uniqueLogsByDate, currentDayMemo: memo });
        } catch (error) {
          console.error("사용자", userId, "의 기록 로드 실패:", error);
          set({ pastLogs: [], currentDayMemo: '' });
        }
      },

      /**
       * 달력에서 선택된 날짜를 변경하고, 해당 날짜의 메모를 로드합니다.
       * @param date - 새로 선택된 날짜 (YYYY-MM-DD 형식)
       */
      setSelectedDate: (date) => {
        const { pastLogs } = get();
        
        // 날짜 변경시 해당 날짜의 메모 로드 (현재 사용자의 것만)
        const selectedLog = pastLogs.find(log => log.exerciseDate === date);
        const memo = selectedLog?.memo || '';
        
        set({ selectedDate: date, currentDayMemo: memo });
      },

      /**
       * 특정 날짜에 새 운동 세션을 시작하거나, 기존에 저장된 세션(로그)을 로드합니다.
       * 루틴별 운동 완료 상태를 로컬 스토리지에 저장하여 세션 유지력을 높입니다.
       * @param userId - 세션을 시작/로드할 사용자의 ID
       * @param routines - 세션에 포함할 루틴 배열
       */
      startOrLoadSession: async (userId, routines) => {
        if (!userId) {
          console.error('사용자 ID가 필요합니다.');
          return;
        }
        
        // 보안 검증: 전달받은 모든 루틴이 현재 사용자 소유인지 확인
        const invalidRoutines = routines.filter(routine => routine.userId !== userId);
        if (invalidRoutines.length > 0) {
          console.error('보안 위험: 다른 사용자의 루틴이 포함됨', invalidRoutines);
          toast.error('권한이 없는 루틴이 포함되어 있습니다.');
          return;
        }
        
        const { selectedDate, pastLogs } = get(); // 현재 선택된 날짜와 과거 로그 가져오기

        // 해당 날짜의 로그를 사용자 ID로 필터링
        const logsForSelectedDate = pastLogs.filter(log => 
          log.exerciseDate === selectedDate && log.userId === userId
        );

        console.log('사용자', userId, '의', selectedDate, '날짜 세션 시작 (보안 검증 후), 로그:', logsForSelectedDate.length, '개');

        // 각 루틴에 대해 세션 데이터를 구성합니다.
        const newSessionRoutines = routines.map(routine => {
          const existingLog = logsForSelectedDate.find(log => log.routineIds.includes(routine.id));
          
          // 세션 상태가 이미 저장되어 있는지 확인 (localStorage에서)
          const sessionStorageKey = `session_${userId}_${selectedDate}_${routine.id}`;
          const savedExerciseStates = localStorage.getItem(sessionStorageKey);
          
          let exercises: SessionExercise[];
          
          if (savedExerciseStates) {
            // 저장된 개별 운동 상태가 있으면 복원
            try {
              const parsedStates = JSON.parse(savedExerciseStates);
              exercises = routine.exercises.map((ex: RoutineExercise) => {
                const savedState = parsedStates.find((state: any) => state.exerciseId === ex.exerciseId);
                return {
                  exerciseId: ex.exerciseId,
                  exerciseName: ex.exerciseName,
                  isCompleted: savedState ? savedState.isCompleted : false,
                };
              });
              console.log(`${routine.name}: 저장된 운동 상태 복원`);
            } catch (error) {
              console.error('저장된 운동 상태 파싱 실패:', error);
              exercises = routine.exercises.map((ex: RoutineExercise) => ({
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                isCompleted: false,
              }));
            }
          } else if (existingLog && existingLog.completionRate !== undefined) {
            // 저장된 상태가 없으면 완료율 기반으로 추정
            exercises = routine.exercises.map((ex: RoutineExercise, index) => {
              let isCompleted = false;
              if (existingLog.completionRate === 100) {
                isCompleted = true;
              } else if (existingLog.completionRate > 0) {
                const totalExercises = routine.exercises.length;
                const completedCount = Math.floor((existingLog.completionRate / 100) * totalExercises);
                isCompleted = index < completedCount;
              }
              return {
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                isCompleted: isCompleted,
              };
            });
            console.log(`${routine.name}: 완료율(${existingLog.completionRate}%) 기반 상태 추정`);
          } else {
            // 새로운 세션
            exercises = routine.exercises.map((ex: RoutineExercise) => ({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              isCompleted: false,
            }));
            console.log(`${routine.name}: 새로운 세션 시작`);
          }
          
          return {
            logId: existingLog?.id || null,
            routineId: routine.id,
            routineName: routine.name,
            exercises: exercises,
            completionRate: existingLog?.completionRate || 0,
            userId: userId,
          };
        });
        
        set(state => ({
          sessions: { ...state.sessions, [selectedDate]: newSessionRoutines }
        }));
      },

      /**
       * 현재 세션에 새로운 루틴들을 추가합니다.
       * 이미 세션에 있는 루틴은 중복 추가되지 않습니다.
       * @param routinesToAdd - 세션에 추가할 루틴 배열
       */
      addRoutinesToSession: (userId, routinesToAdd) => {
        const { selectedDate, sessions } = get();
        const currentRoutines = sessions[selectedDate] || [];
        
        // 추가하려는 루틴 중 현재 세션에 없는 루틴만 필터링하여 `newRoutines` 배열 생성
        const newRoutines = routinesToAdd
          .filter(newRoutine => !currentRoutines.some(existing => existing.routineId === newRoutine.id))
          .map(routine => ({
            logId: null,
            routineId: routine.id,
            routineName: routine.name,
            exercises: routine.exercises.map((ex: RoutineExercise) => ({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              isCompleted: false,
            })),
            completionRate: 0,
            userId: userId,
          }));
        
        if(newRoutines.length > 0) {
          set(state => ({
            sessions: {
              ...state.sessions,
              [selectedDate]: [...currentRoutines, ...newRoutines]
            }
          }));
          toast.info(`${newRoutines.length}개 루틴이 추가되었습니다.`);
        } else {
          toast.info("이미 추가된 루틴입니다.");
        }
      },

      /**
       * 특정 루틴 내 특정 운동의 완료 상태를 토글(체크/체크 해제)하고,
       * 루틴의 완료율을 업데이트하며, 변경사항을 서버에 자동 저장합니다.
       * @param userId - 현재 사용자 ID
       * @param routineId - 상태를 변경할 루틴의 ID
       * @param exerciseId - 상태를 토글할 운동의 ID
       */
      toggleExerciseCheck: async (userId, routineId, exerciseId) => {
        set({ isLoading: true });
        const { selectedDate, sessions } = get();
        const originalSession = sessions[selectedDate] || [];
        const targetRoutine = originalSession.find(r => r.routineId === routineId);
        
        if (!targetRoutine) { set({ isLoading: false }); return; }

        // 해당 운동의 완료 상태를 토글한 새 운동 배열 생성
        const updatedExercises = targetRoutine.exercises.map(ex => 
          ex.exerciseId === exerciseId ? { ...ex, isCompleted: !ex.isCompleted } : ex
        );
        // 완료된 운동 개수 및 새 완료율 계산
        const completedCount = updatedExercises.filter(ex => ex.isCompleted).length;
        const newCompletionRate = (completedCount / updatedExercises.length) * 100;
        // 업데이트된 루틴 객체 생성
        const updatedRoutine = { ...targetRoutine, exercises: updatedExercises, completionRate: newCompletionRate };
        // 로컬 세션 상태를 먼저 업데이트 (낙관적 업데이트)
        const newSession = originalSession.map(r => r.routineId === routineId ? updatedRoutine : r);
        set(state => ({ sessions: { ...state.sessions, [selectedDate]: newSession } }));

        // 개별 운동 상태를 localStorage에 저장
        const sessionStorageKey = `session_${userId}_${selectedDate}_${routineId}`;
        const exerciseStates = updatedExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          isCompleted: ex.isCompleted
        }));
        localStorage.setItem(sessionStorageKey, JSON.stringify(exerciseStates));
        console.log(`운동 상태 저장: ${targetRoutine.routineName} - 완료율 ${newCompletionRate.toFixed(1)}%`);

        try {
          let newLogId = updatedRoutine.logId;
          if (newLogId) {
            // 기존 로그가 있으면 해당 로그의 완료율만 업데이트
            await exerciseLogApi.updateLog(newLogId, { completionRate: newCompletionRate });
          } else {
            // 기존 로그가 없으면 새로운 로그 생성
            const createData = { userId, exerciseDate: selectedDate, completionRate: newCompletionRate, routineIds: [routineId], memo: "" };
            newLogId = await exerciseLogApi.createLog(createData);
            // 생성된 logId를 해당 세션 루틴에 반영 (로컬 상태 업데이트)
            const finalSession = get().sessions[selectedDate].map(r => r.routineId === routineId ? { ...r, logId: newLogId } : r);
            set(state => ({ sessions: { ...state.sessions, [selectedDate]: finalSession } }));
          }
          // 완료율이 100%가 되면 완료 토스트 메시지 표시
          if (newCompletionRate === 100) toast.success(`'${updatedRoutine.routineName}' Complete!`);
          // 변경사항 반영을 위해 과거 로그 데이터를 다시 불러옴
          await get().fetchPastLogs(userId);
        } catch (error) {
          toast.error("Auto-save failed. Please try again.");
          // 오류 발생 시 UI를 원래 상태로 롤백
          set(state => ({ sessions: { ...state.sessions, [selectedDate]: originalSession } }));
        } finally {
          set({ isLoading: false });
        }
      },
      
      /**
       * 현재 날짜의 메모 내용을 업데이트합니다 (로컬 상태만 변경).
       * @param memo - 새로운 메모 내용
       */
      updateMemo: (memo) => {
        set({ currentDayMemo: memo });
      },

      /**
       * 현재 날짜의 메모를 서버에 저장합니다.
       * 해당 날짜의 기존 로그가 있으면 메모만 업데이트하고, 없으면 새로운 로그를 생성합니다.
       * @param userId - 메모를 저장할 사용자의 ID
       */
      saveMemo: async (userId) => {
        const { selectedDate, currentDayMemo, pastLogs, sessions } = get();
        
        try {
          // 해당 날짜의 기존 로그 찾기
          let existingLog = pastLogs.find(log => log.exerciseDate === selectedDate);
          
          if (existingLog?.id) {
            // 기존 로그가 있으면 메모만 업데이트
            await exerciseLogApi.updateMemo(existingLog.id, currentDayMemo);
          } else {
            // 기존 로그가 없으면 새로 생성
            const todaysSession = sessions[selectedDate];
            let routineIds: number[] = [];
            
            // 세션이 있으면 루틴 ID들을 가져옴
            if (todaysSession && todaysSession.length > 0) {
              routineIds = todaysSession.map(session => session.routineId);
            }
            
            // 메모만 있어도 로그 생성 (routineIds가 빈 배열이어도 됨)
            const createData = { 
              userId, 
              exerciseDate: selectedDate, 
              completionRate: 0, 
              routineIds, 
              memo: currentDayMemo 
            };
            await exerciseLogApi.createLog(createData);
          }
          
          // 메모 저장 후 다시 로그 데이터 fetch
          await get().fetchPastLogs(userId);
          toast.success("메모가 저장되었습니다.");
        } catch (error) {
          console.error("Failed to save memo:", error);
          toast.error("메모 저장에 실패했습니다.");
        }
      },

      /**
       * 현재 선택된 날짜의 모든 운동 기록(로그)을 서버와 로컬 스토어에서 삭제합니다.
       * @param userId - 운동 기록을 삭제할 사용자의 ID
       */
      deleteCurrentDayLogs: async (userId) => {
        const { selectedDate, pastLogs } = get();
        
        try {
          // 해당 날짜의 모든 로그를 찾아서 개별적으로 삭제
          const logsToDelete = pastLogs.filter(log => log.exerciseDate === selectedDate);
          
          if (logsToDelete.length === 0) {
            toast.info("삭제할 운동 기록이 없습니다.");
            return;
          }

          // 각 로그를 개별적으로 삭제
          for (const log of logsToDelete) {
            if (log.id) {
              await exerciseLogApi.deleteLog(log.id);
            }
          }
          
          // 로컬 상태도 업데이트
          set(state => ({
            sessions: { ...state.sessions, [selectedDate]: [] },
            currentDayMemo: '',
          }));
          
          // localStorage에서 해당 날짜의 모든 세션 상태 삭제
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`session_${userId}_${selectedDate}_`)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          console.log(`${selectedDate} 날짜의 모든 세션 상태 정리:`, keysToRemove.length, '개');
          
          // 전체 로그 다시 가져오기
          await get().fetchPastLogs(userId);
          toast.success(`${logsToDelete.length}개의 운동 기록이 삭제되었습니다.`);
        } catch (error) {
          console.error("Failed to delete logs:", error);
          toast.error("운동 기록 삭제에 실패했습니다.");
        }
      },

      /**
       * 현재 세션에서 특정 루틴을 삭제하고, 해당 루틴과 연결된 서버 로그도 삭제합니다.
       * @param userId - 현재 사용자 ID
       * @param routineId - 세션에서 삭제할 루틴의 ID
       */
      deleteRoutineFromSession: async (userId: number, routineId: number) => {
        const { selectedDate, sessions } = get();
        
        try {
          // 해당 루틴의 로그 ID 찾기
          const currentSession = sessions[selectedDate] || [];
          const targetRoutine = currentSession.find(r => r.routineId === routineId);
          
          if (targetRoutine && targetRoutine.logId && targetRoutine.logId > 0) {
            // 서버에 실제 로그가 있는 경우만 삭제 요청
            console.log('서버에서 로그 삭제:', targetRoutine.logId);
            await exerciseLogApi.deleteLog(targetRoutine.logId);
          } else {
            console.log('로컬 세션에서만 루틴 제거 (로그 ID 없음):', routineId);
          }
          
          // 로컬 세션에서 해당 루틴 제거
          const updatedSession = currentSession.filter(r => r.routineId !== routineId);
          
          set(state => ({
            sessions: { ...state.sessions, [selectedDate]: updatedSession }
          }));
          
          // localStorage에서 해당 루틴의 세션 상태 삭제
          const sessionStorageKey = `session_${userId}_${selectedDate}_${routineId}`;
          localStorage.removeItem(sessionStorageKey);
          console.log(`루틴 ${routineId}의 세션 상태 정리 완료`);
          
          // 전체 로그 다시 가져오기
          await get().fetchPastLogs(userId);
          toast.success("루틴이 삭제되었습니다.");
        } catch (error) {
          console.error("Failed to delete routine:", error);
          // 404 에러인 경우 이미 삭제된 것으로 간주하고 로컬에서만 제거
          if ((error as any)?.response?.status === 404) {
            console.log('로그가 이미 삭제됨, 로컬에서만 제거');
            const { selectedDate, sessions } = get();
            const currentSession = sessions[selectedDate] || [];
            const updatedSession = currentSession.filter(r => r.routineId !== routineId);
            
            set(state => ({
              sessions: { ...state.sessions, [selectedDate]: updatedSession }
            }));
            
            // localStorage에서 해당 루틴의 세션 상태 삭제 (에러 케이스에서도)
            const sessionStorageKey = `session_${userId}_${selectedDate}_${routineId}`;
            localStorage.removeItem(sessionStorageKey);
            
            await get().fetchPastLogs(userId);
            toast.success("루틴이 삭제되었습니다.");
          } else {
            toast.error("루틴 삭제에 실패했습니다.");
          }
        }
      },

      /**
       * 현재 선택된 날짜의 세션 루틴을 초기화합니다.
       * (주로 날짜 변경 시 또는 특정 상황에서 세션을 비울 때 사용)
       */
      clearSessionRoutines: () => {
        const { selectedDate } = get();
        console.log('세션 루틴 초기화:', selectedDate);
        set(state => ({
          sessions: { ...state.sessions, [selectedDate]: [] }
        }));
      }
    }),
    {
      name: 'exercise-log-storage',
      // `partialize`를 사용하여 스토어 상태 중 일부만 영속화합니다.
      // `pastLogs`는 매번 `fetchPastLogs`를 통해 서버에서 불러오므로 영속화할 필요가 없습니다.
      partialize: (state) => ({ 
        selectedDate: state.selectedDate,
        sessions: state.sessions,
        currentDayMemo: state.currentDayMemo, // 메모도 persist에 포함
      }),
    }
  )
);