import axiosInstance from '@/api/axiosInstance';
import type { EmotionLogDTO } from '@/types/index'; 

export const getLogsByUser = async (userId: number): Promise<EmotionLogDTO[]> => {
  console.log(`[API] Fetching emotion logs for user: ${userId}`);
  const response = await axiosInstance.get(`/emotion-logs/user/${userId}`);
  return response.data;
};

/**
 * 감성 기록을 생성하거나 수정합니다. (백엔드에서 자동 분기 처리)
 */
export const saveOrUpdateEmotionLog = async (data: EmotionLogDTO): Promise<EmotionLogDTO> => {
  console.log('[API] Saving (create or update) emotion log:', data);
  const response = await axiosInstance.post('/emotion-logs', data);
  return response.data;
};


export const deleteEmotionLog = async (logId: number): Promise<void> => {
  await axiosInstance.delete(`/emotion-logs/${logId}`);
};