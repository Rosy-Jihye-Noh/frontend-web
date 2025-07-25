import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import * as emotionLogApi from '@/services/api/emotionLogApi';
import type { EmotionLogDTO } from '@/types/index';
import type { EmotionType } from '@/types/index';

interface EmotionLogState {
  emotionLogs: EmotionLogDTO[];
  selectedDate: string;
  currentDayEmotion: EmotionType | null;
  currentDayMemo: string;
  isLoading: boolean;
  fetchEmotionLogs: (userId: number) => Promise<void>;
  setSelectedDate: (date: string) => void;
  setEmotionForDay: (emotion: EmotionType | null) => void;
  updateMemo: (memo: string) => void;
  saveCurrentLog: (userId: number) => Promise<void>;
  deleteEmotionLog: (logId: number, userId: number) => Promise<void>;
  clearEmotionData: () => void;
}

export const useEmotionLogStore = create<EmotionLogState>()(
  persist(
    (set, get) => ({
      emotionLogs: [],
      selectedDate: new Date().toISOString().split('T')[0],
      currentDayEmotion: null,
      currentDayMemo: '',
      isLoading: false,

      fetchEmotionLogs: async (userId) => {
        if (!userId) {
          set({ emotionLogs: [] });
          return;
        }
        set({ isLoading: true });
        try {
          const logs = await emotionLogApi.getLogsByUser(userId);
          set({ emotionLogs: logs });
          get().setSelectedDate(get().selectedDate);
        } catch (error) {
          console.error('감성 기록 로딩 실패:', error);
          toast.error('감성 기록을 불러오는데 실패했습니다.');
        } finally {
          set({ isLoading: false });
        }
      },

      setSelectedDate: (date) => {
        const { emotionLogs } = get();
        const logForDate = emotionLogs.find(log => log.exerciseDate.toString().startsWith(date));
        set({
          selectedDate: date,
          currentDayEmotion: logForDate?.emotion || null,
          currentDayMemo: logForDate?.memo || '',
        });
      },

      setEmotionForDay: (emotion) => set({ currentDayEmotion: emotion }),

      updateMemo: (memo) => set({ currentDayMemo: memo }),

      /**
       * (수정됨) 현재 감성과 메모를 저장/수정합니다.
       * 만약 메모가 비어있다면, 기존 기록을 삭제합니다.
       */
      saveCurrentLog: async (userId) => {
        const { selectedDate, currentDayMemo, emotionLogs } = get();
        const existingLog = emotionLogs.find(log => log.exerciseDate.toString().startsWith(selectedDate));

        // 💡 변경점 1: 메모가 비어있는 경우의 로직
        if (!currentDayMemo.trim()) {
          // 이미 해당 날짜에 기록이 있다면 삭제 API를 호출합니다.
          if (existingLog && existingLog.id) {
            set({ isLoading: true });
            try {
              // 기존에 있던 deleteEmotionLog 함수를 재사용합니다.
              await emotionLogApi.deleteEmotionLog(existingLog.id);
              toast.success("기록이 삭제되었습니다.");
              // 데이터를 다시 불러와 화면을 갱신합니다.
              await get().fetchEmotionLogs(userId);
            } catch (error) {
              console.error('기록 삭제 실패:', error);
              toast.error('기록 삭제에 실패했습니다.');
            } finally {
              set({ isLoading: false });
            }
          }
          // 원래 기록이 없었다면 아무 작업도 하지 않고 함수를 종료합니다.
          return;
        }

        // 💡 변경점 2: 메모가 비어있지 않은 경우, 기존의 저장 로직을 수행합니다.
        set({ isLoading: true });
        try {
          const logData: EmotionLogDTO = {
            id: existingLog ? existingLog.id : 0,
            userId,
            exerciseDate: selectedDate,
            emotion: 'NEUTRAL', // 백엔드에서 memo를 보고 새로 분석하므로 임시값
            memo: currentDayMemo,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await emotionLogApi.saveOrUpdateEmotionLog(logData);
          toast.success('기록이 저장되었습니다.');
          
          await get().fetchEmotionLogs(userId);
        } catch (error) {
          console.error('감성 기록 저장 실패:', error);
          toast.error('저장에 실패했습니다.');
        } finally {
          set({ isLoading: false });
        }
      },

      deleteEmotionLog: async (logId, userId) => {
        set({ isLoading: true });
        try {
          await emotionLogApi.deleteEmotionLog(logId);
          toast.success('기록이 삭제되었습니다.');
          await get().fetchEmotionLogs(userId);
        } catch (error) {
          console.error('감성 기록 삭제 실패:', error);
          toast.error('삭제에 실패했습니다.');
        } finally {
          set({ isLoading: false });
        }
      },
      
      clearEmotionData: () => {
        set({
          emotionLogs: [],
          selectedDate: new Date().toISOString().split('T')[0],
          currentDayEmotion: null,
          currentDayMemo: '',
        });
      },
    }),
    {
      name: 'emotion-log-storage',
      partialize: (state) => ({ selectedDate: state.selectedDate }),
    }
  )
);