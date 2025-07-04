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
  addRoutinesToSession: (routines: Routine[]) => void;
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

      fetchPastLogs: async (userId) => {
        if (!userId) {
          console.warn('사용자 ID가 없습니다.');
          set({ pastLogs: [], currentDayMemo: '' });
          return;
        }
        
        try {
          console.log('사용자', userId, '의 운동 기록을 가져오는 중...');
          const logs = await exerciseLogApi.getLogsByUser(userId);
          
          // 사용자 ID로 한번 더 필터링 (보안 강화)
          const filteredLogs = logs?.filter(log => log.userId === userId) || [];
          console.log('필터링된 로그:', filteredLogs.length, '개');
          
          const { selectedDate } = get();
          
          // 선택된 날짜의 메모 로드 (해당 사용자의 것만)
          const todaysLog = filteredLogs.find(log => 
            log.exerciseDate === selectedDate && log.userId === userId
          );
          const memo = todaysLog?.memo || '';
          
          set({ pastLogs: filteredLogs, currentDayMemo: memo });
        } catch (error) {
          console.error("사용자", userId, "의 기록 로드 실패:", error);
          set({ pastLogs: [], currentDayMemo: '' });
        }
      },

      setSelectedDate: (date) => {
        const { pastLogs } = get();
        
        // 날짜 변경시 해당 날짜의 메모 로드 (현재 사용자의 것만)
        const selectedLog = pastLogs.find(log => log.exerciseDate === date);
        const memo = selectedLog?.memo || '';
        
        console.log('날짜 변경:', date, '메모:', memo);
        set({ selectedDate: date, currentDayMemo: memo });
      },

      startOrLoadSession: async (userId, routines) => {
        if (!userId) {
          console.error('사용자 ID가 필요합니다.');
          return;
        }
        
        const { selectedDate, pastLogs, sessions } = get();
        
        if (sessions[selectedDate] && sessions[selectedDate].length > 0) {
          toast.info("이미 진행 중인 운동이 있습니다.");
          return;
        }

        // 해당 날짜의 로그를 사용자 ID로 필터링
        const logsForSelectedDate = pastLogs.filter(log => 
          log.exerciseDate === selectedDate && log.userId === userId
        );

        console.log('사용자', userId, '의', selectedDate, '날짜 세션 시작, 로그:', logsForSelectedDate.length, '개');

        const newSessionRoutines = routines.map(routine => {
          const existingLog = logsForSelectedDate.find(log => log.routineIds.includes(routine.id));
          const isCompleted = existingLog?.completionRate === 100;
          return {
            logId: existingLog?.id || null,
            routineId: routine.id,
            routineName: routine.name,
            exercises: routine.exercises.map((ex: RoutineExercise) => ({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              isCompleted: isCompleted,
            })),
            completionRate: existingLog?.completionRate || 0,
          };
        });
        
        set(state => ({
          sessions: { ...state.sessions, [selectedDate]: newSessionRoutines }
        }));
      },

      addRoutinesToSession: (routinesToAdd) => {
        const { selectedDate, sessions } = get();
        const currentRoutines = sessions[selectedDate] || [];
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
          }));
        
        if(newRoutines.length > 0) {
          set(state => ({
            sessions: {
              ...state.sessions,
              [selectedDate]: [...currentRoutines, ...newRoutines]
            }
          }));
          toast.info(`${newRoutines.length} routine(s) added.`);
        } else {
          toast.info("This routine has already been added.");
        }
      },

      toggleExerciseCheck: async (userId, routineId, exerciseId) => {
        set({ isLoading: true });
        const { selectedDate, sessions } = get();
        const originalSession = sessions[selectedDate] || [];
        const targetRoutine = originalSession.find(r => r.routineId === routineId);
        
        if (!targetRoutine) { set({ isLoading: false }); return; }

        const updatedExercises = targetRoutine.exercises.map(ex => 
          ex.exerciseId === exerciseId ? { ...ex, isCompleted: !ex.isCompleted } : ex
        );
        const completedCount = updatedExercises.filter(ex => ex.isCompleted).length;
        const newCompletionRate = (completedCount / updatedExercises.length) * 100;
        const updatedRoutine = { ...targetRoutine, exercises: updatedExercises, completionRate: newCompletionRate };
        
        const newSession = originalSession.map(r => r.routineId === routineId ? updatedRoutine : r);
        set(state => ({ sessions: { ...state.sessions, [selectedDate]: newSession } }));

        try {
          let newLogId = updatedRoutine.logId;
          if (newLogId) {
            await exerciseLogApi.updateLog(newLogId, { completionRate: newCompletionRate });
          } else {
            const createData = { userId, exerciseDate: selectedDate, completionRate: newCompletionRate, routineIds: [routineId], memo: "" };
            newLogId = await exerciseLogApi.createLog(createData);
            const finalSession = get().sessions[selectedDate].map(r => r.routineId === routineId ? { ...r, logId: newLogId } : r);
            set(state => ({ sessions: { ...state.sessions, [selectedDate]: finalSession } }));
          }
          if (newCompletionRate === 100) toast.success(`'${updatedRoutine.routineName}' Complete!`);
          await get().fetchPastLogs(userId);
        } catch (error) {
          toast.error("Auto-save failed. Please try again.");
          set(state => ({ sessions: { ...state.sessions, [selectedDate]: originalSession } }));
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateMemo: (memo) => {
        set({ currentDayMemo: memo });
      },

      saveMemo: async (userId) => {
        const { selectedDate, currentDayMemo, pastLogs, sessions } = get();
        
        try {
          // 해당 날짜의 기존 로그 찾기
          let existingLog = pastLogs.find(log => log.exerciseDate === selectedDate);
          
          if (existingLog?.id) {
            // 기존 로그가 있으면 메모만 업데이트
            await exerciseLogApi.updateMemo(existingLog.id, currentDayMemo);
          } else {
            // 기존 로그가 없으면 새로 생성 (세션이 있을 경우에만)
            const todaysSession = sessions[selectedDate];
            if (todaysSession && todaysSession.length > 0) {
              const routineIds = todaysSession.map(session => session.routineId);
              const createData = { 
                userId, 
                exerciseDate: selectedDate, 
                completionRate: 0, 
                routineIds, 
                memo: currentDayMemo 
              };
              await exerciseLogApi.createLog(createData);
            }
          }
          
          // 메모 저장 후 다시 로그 데이터 fetch
          await get().fetchPastLogs(userId);
          toast.success("메모가 저장되었습니다.");
        } catch (error) {
          console.error("Failed to save memo:", error);
          toast.error("메모 저장에 실패했습니다.");
        }
      },

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
          
          // 전체 로그 다시 가져오기
          await get().fetchPastLogs(userId);
          toast.success(`${logsToDelete.length}개의 운동 기록이 삭제되었습니다.`);
        } catch (error) {
          console.error("Failed to delete logs:", error);
          toast.error("운동 기록 삭제에 실패했습니다.");
        }
      },

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
            
            await get().fetchPastLogs(userId);
            toast.success("루틴이 삭제되었습니다.");
          } else {
            toast.error("루틴 삭제에 실패했습니다.");
          }
        }
      },

      clearSessionRoutines: () => {
        const { selectedDate } = get();
        set(state => ({
          sessions: { ...state.sessions, [selectedDate]: [] }
        }));
      }
    }),
    {
      name: 'exercise-log-storage',
      partialize: (state) => ({ 
        selectedDate: state.selectedDate,
        sessions: state.sessions,
        currentDayMemo: state.currentDayMemo, // 메모도 persist에 포함
      }),
    }
  )
);