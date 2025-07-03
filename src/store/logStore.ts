// src/store/logStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import * as exerciseLogApi from '@/services/api/exerciseLogApi';
import type { Routine, RoutineExercise, ExerciseLog } from '@/types/index';
import { useUserStore } from './userStore';

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
  isLoading: boolean;
  fetchPastLogs: (userId: number) => Promise<void>;
  setSelectedDate: (date: string) => void;
  startOrLoadSession: (userId: number, routines: Routine[]) => Promise<void>;
  // ▼▼▼ This line was missing. Add it here. ▼▼▼
  addRoutinesToSession: (routines: Routine[]) => void;
  toggleExerciseCheck: (userId: number, routineId: number, exerciseId: number) => Promise<void>;
  clearSessionRoutines: () => void;
}

export const useLogStore = create<LogSessionState>()(
  persist(
    (set, get) => ({
      selectedDate: new Date().toISOString().split('T')[0],
      sessions: {},
      pastLogs: [] as ExerciseLog[],
      isLoading: false,

      fetchPastLogs: async (userId) => {
        try {
          const logs = await exerciseLogApi.getLogsByUser(userId);
          set({ pastLogs: logs || [] });
        } catch (error) {
          console.error("Failed to fetch past logs:", error);
        }
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      startOrLoadSession: async (userId, routines) => {
        const { selectedDate, pastLogs, sessions } = get();
        
        if (sessions[selectedDate] && sessions[selectedDate].length > 0) {
          toast.info("A workout is already in progress.");
          return;
        }

        const logsForSelectedDate = pastLogs.filter(log => log.exerciseDate === selectedDate);

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
      }),
    }
  )
);