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
          // fetch 후, 현재 선택된 날짜의 정보로 다시 UI를 업데이트합니다.
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
        // DTO의 날짜 필드 이름이 exerciseDate로 통일되었으므로 그대로 사용
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
       * 현재 감성과 메모를 저장/수정합니다.
       * 백엔드의 통합된 POST 엔드포인트를 호출합니다.
       */
      saveCurrentLog: async (userId) => {
        const { selectedDate, currentDayEmotion, currentDayMemo, emotionLogs } = get();

        if (!currentDayEmotion) {
          toast.warning('감정을 선택해주세요.');
          return;
        }

        set({ isLoading: true });
        try {
          // 기존 로그를 찾아 ID를 포함시킵니다.
          const existingLog = emotionLogs.find(log => log.exerciseDate.toString().startsWith(selectedDate));

          const logData: EmotionLogDTO = {
            // 기존 로그가 있으면 해당 ID를, 없으면 0이나 null을 보냅니다.
            id: existingLog ? existingLog.id : 0, 
            userId,
            // new Date()로 감싸지 않고 문자열 그대로 전송합니다.
            exerciseDate: selectedDate, 
            emotion: currentDayEmotion,
            memo: currentDayMemo,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await emotionLogApi.saveOrUpdateEmotionLog(logData);
          toast.success('기록이 저장되었습니다.');
          
          await get().fetchEmotionLogs(userId); // 저장 후 데이터 다시 로드
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