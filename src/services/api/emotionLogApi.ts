import axiosInstance from '@/api/axiosInstance';
import type { EmotionLogDTO } from '@/types/index'; 

export const getLogsByUser = async (userId: number): Promise<EmotionLogDTO[]> => {
  console.log(`[API] Fetching emotion logs for user: ${userId}`);
  
  // 💡 변경점: 요청 URL에 매번 바뀌는 타임스탬프를 파라미터로 추가하여 캐시 문제를 해결합니다.
  const response = await axiosInstance.get(`/emotion-logs/user/${userId}`, {
    params: {
      // 이 파라미터는 서버에서는 사용하지 않지만, 브라우저가 항상 새로운 요청으로 인식하게 만듭니다.
      timestamp: new Date().getTime(),
    }
  });

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