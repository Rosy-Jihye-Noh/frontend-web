import axiosInstance from '../../api/axiosInstance';

export interface ChatRequestDTO {
  userId: number;
  sessionId?: string;
  message: string;
  content?: string;
  videoUrl?: string;
}

export interface ChatResponseDTO {
  type: string;
  response: string;
  sessionId?: string;
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
 * 대화 기록을 조회합니다.
 * @param userId - 사용자 ID
 * @param sessionId - 세션 ID
 */
export const getChatHistory = async (userId: number, sessionId: string): Promise<ChatMessageDTO[]> => {
  try {
    const response = await axiosInstance.get(`/chatbot/history/${userId}/${sessionId}`);
    return response.data || [];
  } catch (error) {
    throw new Error('대화 기록 조회에 실패했습니다.');
  }
};

/**
 * 챗봇 메시지를 전송합니다.
 * @param request - 메시지 전송 요청 데이터
 */
export const sendChatMessage = async (request: ChatRequestDTO): Promise<ChatResponseDTO> => {
  try {
    const response = await axiosInstance.post('/chatbot/send', request);
    return response.data;
  } catch (error) {
    throw new Error('메시지 전송에 실패했습니다.');
  }
};

/**
 * 초기 메시지를 저장합니다.
 * @param request - 초기 메시지 저장 요청 데이터
 */
export const saveInitialMessage = async (request: ChatRequestDTO): Promise<ChatResponseDTO> => {
  try {
    const response = await axiosInstance.post('/chatbot/init-message', request);
    return response.data;
  } catch (error) {
    throw new Error('초기 메시지 저장에 실패했습니다.');
  }
};

/**
 * 강제로 메시지를 추가합니다.
 * @param request - 강제 메시지 추가 요청 데이터
 */
export const forceAddMessage = async (request: ChatRequestDTO): Promise<ChatResponseDTO> => {
  try {
    const response = await axiosInstance.post('/chatbot/force-message', request);
    return response.data;
  } catch (error) {
    throw new Error('메시지 추가에 실패했습니다.');
  }
}; 