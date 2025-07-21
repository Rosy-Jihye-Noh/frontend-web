import axiosInstance from '../../api/axiosInstance';

export interface ChatRequestDTO {
  type?: string; // 'recommend' | 'summary' | 'comment_summary' (Youtube에서만)
  userId: number;
  historyId?: number;
  sessionId?: string;
  message?: string;
  content?: string;
  videoUrl?: string;
}

export interface ChatResponseDTO {
  type: string;
  response: string;
  sessionId?: string;
  videoUrl?: string;
  videoTitle?: string;
}

export interface ChatMessageDTO {
  type: string;
  content: string;
  timestamp?: string;
  videoUrl?: string;
}

/**
 * 사용자별 활성 세션을 조회합니다.
 * @param userId - 사용자 ID
 */
export const getActiveSession = async (userId: number): Promise<string> => {
  try {
    const response = await axiosInstance.get(`/chatbot/active-session/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('활성 세션 조회에 실패했습니다.');
  }
};

/**
 * 새로운 세션을 시작합니다.
 * @param userId - 사용자 ID
 */
export const startNewSession = async (userId: number): Promise<string> => {
  try {
    const response = await axiosInstance.post(`/chatbot/new-session/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('새 세션 시작에 실패했습니다.');
  }
};

/**
 * 대화 기록을 조회합니다. (현재 활성 세션)
 * @param userId - 사용자 ID
 */
export const getChatHistory = async (userId: number): Promise<ChatMessageDTO[]> => {
  try {
    const response = await axiosInstance.get(`/chatbot/history/${userId}`);
    return response.data || [];
  } catch (error) {
    throw new Error('대화 기록 조회에 실패했습니다.');
  }
};

/**
 * 특정 세션의 대화 기록을 조회합니다.
 * @param userId - 사용자 ID
 * @param sessionId - 세션 ID
 */
export const getChatHistoryBySession = async (userId: number, sessionId: string): Promise<ChatMessageDTO[]> => {
  try {
    const response = await axiosInstance.get(`/chatbot/history/${userId}/${sessionId}`);
    return response.data || [];
  } catch (error) {
    throw new Error('특정 세션 대화 기록 조회에 실패했습니다.');
  }
};

/**
 * AI코치/운동추천 메시지를 전송합니다. (FastAPI /ai-coach)
 * @param request - 메시지 전송 요청 데이터
 */
export const sendAiCoachMessage = async (request: ChatRequestDTO): Promise<ChatResponseDTO> => {
  try {
    const response = await axiosInstance.post('/chatbot/send', request);
    return response.data;
  } catch (error) {
    throw new Error('AI코치 메시지 전송에 실패했습니다.');
  }
};

/**
 * 유튜브(영상추천/스크립트/댓글요약) 메시지를 전송합니다. (FastAPI /youtube)
 * @param request - 메시지 전송 요청 데이터 (type 필수)
 */
export const sendYoutubeMessage = async (request: ChatRequestDTO): Promise<ChatResponseDTO> => {
  try {
    const response = await axiosInstance.post('/chatbot/send', request);
    return response.data;
  } catch (error) {
    throw new Error('유튜브 메시지 전송에 실패했습니다.');
  }
}; 