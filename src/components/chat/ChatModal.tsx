import { X } from "lucide-react";
import { HiUser } from "react-icons/hi";
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import {
  getActiveSession,
  getChatHistory,
  sendAiCoachMessage,
  sendYoutubeMessage,
  type ChatMessageDTO,
  type ChatRequestDTO,
  type ChatResponseDTO
} from "../../services/api/chatbotApi";
import { useUserStore } from "../../store/userStore";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchExerciseByExactName } from '@/services/api/exerciseApi';
import { createRoutineWithExercise, addExerciseToRoutineApi, getRoutinesByUser, fetchExercisesInRoutine } from '@/services/api/routineApi';
import type { AnalysisHistoryItem } from '@/types/index';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initType?: 'video' | 'consult' | null;
  initPayload?: any;
  onInputFocus?: () => void;
  userId?: number;
  historyId?: number;
  initialUserMessage?: string;
  initialVideoUrl?: string;
  analysis?: AnalysisHistoryItem; // 추가
}

interface ChatMessage {
  type: "user" | "bot";
  content: React.ReactNode;
  timestamp?: string;
}

const CHATBOT_CONFIG = {
  VIDEO_URL: 'https://www.youtube.com/watch?v=fFIL0rlRH78',
  THUMBNAIL_URL: 'https://img.youtube.com/vi/fFIL0rlRH78/0.jpg',
  VIDEO_MESSAGE: '스크립트 요약과 댓글의 분석이 필요할 경우 요청주세요.',
  CONSULT_MESSAGE: 'OOO 운동을 추천드립니다. 루틴에 추가하시겠습니까?'
} as const;

function getYoutubeId(url: string) {
  const match = url.match(/(?:v=|be\/|embed\/|googleusercontent.com\/youtube.com\/)([\w-]{11}|\d+)/);
  return match ? match[1] : '';
}

const ChatModal = forwardRef<any, Props>(({ isOpen, onClose, initType, initPayload, onInputFocus, userId, historyId, initialUserMessage, initialVideoUrl, analysis }, ref) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const { user } = useUserStore();
  const [isMinimized, setIsMinimized] = useState(true);
  const initialRequestSentRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // analysis에서 직접 추천운동명 가져오기
  const recommendedExerciseName = analysis?.recommendedExercise?.name || null;
  const [showRoutineSelect, setShowRoutineSelect] = useState(false);
  const [userRoutines, setUserRoutines] = useState<any[]>([]); // Routine 타입으로 교체 가능

  // handleCommentSummary를 ChatModal 함수 내부에 선언
  const handleCommentSummary = async (videoUrl: string) => {
    if (!userId || !historyId) return;
    const userMessage: ChatMessage = { type: "user", content: `댓글 요약해주세요: ${videoUrl}` };
    setMessages(prev => [...prev, userMessage]);
    const payload: ChatRequestDTO = {
      type: 'comment_summary',
      userId,
      historyId,
      message: `댓글 요약해주세요: ${videoUrl}`,
      videoUrl,
    };
    try {
      const aiRes = await sendYoutubeMessage(payload);
      if (aiRes.type === 'error') {
        setMessages(prev => [
          ...prev,
          { type: "bot", content: aiRes.response }
        ]);
        return;
      }
      const botMessage: ChatMessage = { type: "bot", content: aiRes.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { type: "bot", content: "댓글 요약 중 오류가 발생했습니다. 다시 시도해 주세요." }
      ]);
    }
  };

  // 신규 루틴에 추가
  const handleAddToNewRoutine = async () => {
    if (!userId || !recommendedExerciseName) return;
    const exercise = await fetchExerciseByExactName(recommendedExerciseName);
    if (!exercise) {
      alert('해당 이름의 운동이 존재하지 않습니다.');
      return;
    }
    const routineName = "AI 추천 루틴";
    const routineDescription = "AI가 추천한 맞춤 루틴입니다.";
    const order = 1;
    try {
      const createdRoutine = await createRoutineWithExercise(userId, {
        routineDTO: { name: routineName, description: routineDescription },
        exerciseId: exercise.id,
        order
      });
      alert('신규 루틴에 운동이 추가되었습니다!');
      navigate(`/routines/${createdRoutine.id}`); // 상세페이지로 이동
    } catch (e) {
      alert('신규 루틴 추가에 실패했습니다.');
    }
  };

  // 기존 루틴에 추가 버튼 클릭 시 루틴 목록 로드 및 모달 노출
  const handleShowRoutineSelect = async () => {
    if (!userId) return;
    const routines = await getRoutinesByUser(userId);
    setUserRoutines(routines);
    setShowRoutineSelect(true);
  };

  // 기존 루틴에 운동 추가
  const handleAddToExistingRoutine = async (routineId: number) => {
    if (!recommendedExerciseName) return;
    const exercise = await fetchExerciseByExactName(recommendedExerciseName);
    if (!exercise) {
      alert('해당 이름의 운동이 존재하지 않습니다.');
      return;
    }
    try {
      // 1. 해당 루틴의 운동 목록 조회
      const exercisesInRoutine = await fetchExercisesInRoutine(routineId);
      // 2. 이미 포함되어 있는지 확인
      const isDuplicate = exercisesInRoutine.some((ex: any) => ex.exerciseId === exercise.id);
      if (isDuplicate) {
        alert('이미 해당 루틴에 추가된 운동입니다.');
        return;
      }
      // 3. 중복이 아니면 추가 진행
      await addExerciseToRoutineApi(routineId, exercise.id); // order 파라미터 제거
      alert('기존 루틴에 운동이 추가되었습니다!');
      setShowRoutineSelect(false);
      navigate(`/routines/${routineId}`); // 상세페이지로 이동
    } catch (e) {
      alert('기존 루틴 추가에 실패했습니다.');
    }
  };

  // convertBackendMessageToFrontend 함수는 마크다운 변환 포함
  const convertBackendMessageToFrontend = (msg: ChatMessageDTO): ChatMessage => {
    if (msg.type === 'bot' && msg.videoUrl) {
      const videoId = getYoutubeId(msg.videoUrl);
      return {
        type: 'bot',
        content: (
          <div>
            <iframe
              width="320"
              height="180"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded mb-2"
            ></iframe>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            <button
              onClick={() => handleCommentSummary(msg.videoUrl!)}
              className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              📊 댓글 요약 보기
            </button>
          </div>
        ),
        timestamp: msg.timestamp
      };
    }
    return {
      type: msg.type as "user" | "bot",
      content: msg.type === 'bot'
        ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
        : msg.content,
      timestamp: msg.timestamp
    };
  };

  // userId, sessionId가 바뀔 때만 상태 초기화
  useEffect(() => {
    setSessionId("");
    setMessages([]);
    setInput("");
    setIsMinimized(true);
    initialRequestSentRef.current = false;
  }, [userId]);

  // ESC 키 누르면 minimized로 전환
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMinimized(true);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // 모달이 닫힐 때 중복 호출 ref 초기화
  useEffect(() => {
    if (!isOpen) {
      initialRequestSentRef.current = false;
    }
  }, [isOpen]);

  // 세션 조회 및 대화 내역 로드
  const loadSessionAndHistory = async (): Promise<string | null> => {
    if (!userId) return null;
    try {
      let sid = sessionId;
      if (!sid || sid.trim() === '') {
        const res = await getActiveSession(userId);
        sid = res;
        if (!sid || sid.trim() === '') {
          setSessionId('');
          setMessages([]);
          return '';
        }
        setSessionId(sid);
      }
      if (sid) {
        const historyRes = await getChatHistory(userId);
        const historyData = historyRes || [];
        setMessages(historyData.map(convertBackendMessageToFrontend));
      } else {
        setMessages([]);
      }
      return sid;
    } catch (error) {
      setMessages([]);
      return null;
    }
  };

  // ChatModal이 열릴 때마다 항상 Redis에서 대화 내역 불러오기
  useEffect(() => {
    if (!isOpen || !userId) return;
    let isMounted = true;
    loadSessionAndHistory().then((sid) => {
      if (isMounted && sid) {
        // 대화 내역을 불러온 후, messages 상태에 변환해서 저장
        // 이미 loadSessionAndHistory에서 처리됨
      }
    });
    return () => { isMounted = false; };
  }, [isOpen, userId]);

  // 버튼 클릭만으로 FastAPI 호출: isOpen+userId+historyId+initialUserMessage(또는 initialVideoUrl) 있으면 바로 요청
  useEffect(() => {
    if (
      isOpen &&
      userId &&
      historyId &&
      !isNaN(historyId) &&
      !initialRequestSentRef.current &&
      (initialUserMessage || initialVideoUrl)
    ) {
      initialRequestSentRef.current = true;
      setIsLoading(true);
      const message = initialUserMessage || (initType === 'video' ? '추천 영상 보여줘' : '운동 추천해줘');
      const payload: ChatRequestDTO = {
        type: initType === 'video' ? 'recommend' : undefined,
        userId,
        historyId,
        message,
      };
      const apiCall = initType === 'video' ? sendYoutubeMessage : sendAiCoachMessage;
      apiCall(payload).then(aiRes => {
        setIsLoading(false);
        const userMsg: ChatMessage = { type: 'user', content: message };
        
        // AI 응답을 프론트엔드 메시지 형식으로 변환
        const convertBackendMessageToFrontend = (aiRes: any) => {
          
          let botMessage: ChatMessage;
          
          if (aiRes.videoUrl || (aiRes as any).video_url) {
            const videoUrl = aiRes.videoUrl || (aiRes as any).video_url;
            const videoId = getYoutubeId(videoUrl);
            const iframeSrc = `https://www.youtube.com/embed/${videoId}`;
            botMessage = {
              type: "bot",
              content: (
                <div>
                  <iframe
                    width="320"
                    height="180"
                    src={iframeSrc}
                    title={aiRes.videoTitle || (aiRes as any).video_title || "추천 영상"}
                    style={{ border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded mb-2"
                  ></iframe>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiRes.response}</ReactMarkdown>
                  <button
                    onClick={() => handleCommentSummary(videoUrl)}
                    className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    📊 댓글 요약 보기
                  </button>
                </div>
              )
            };
          } else {
            botMessage = {
              type: "bot",
              content: <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiRes.response}</ReactMarkdown>
            };
          }
          
          return botMessage;
        };

        const botMsg = convertBackendMessageToFrontend(aiRes);
        setMessages(prev => [...prev, userMsg, botMsg]); // 이전 대화내역에 추가
      }).catch(() => setIsLoading(false));
    }
  }, [isOpen, userId, historyId, initialUserMessage, initialVideoUrl, initType]);

  // 초기 메시지 추가 (기존 Spring용, FastAPI 즉시 호출 시에는 생략)
  const addInitialMessage = async (currentMessages: ChatMessage[]) => {
    // 더 이상 사용하지 않음
  };

  // 세션 로드 후 초기 메시지 추가
  useEffect(() => {
    // 더 이상 사용하지 않음
  }, []);

  // 메시지 전송 핸들러
  const handleSend = async () => {
    if (!input.trim() || !userId || !historyId) {
      return;
    }
    
    const userMessage: ChatMessage = { type: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    const payload: ChatRequestDTO = {
      type: initType === 'video' ? 'recommend' : undefined,
      userId,
      historyId,
      message: input,
      recommendedExercise: analysis?.recommendedExercise // 추가
    };
    
    try {
      const apiCall = initType === 'video' ? sendYoutubeMessage : sendAiCoachMessage;
      const aiRes = await apiCall(payload);
      setIsLoading(false);
      
      if (aiRes.type === 'error') {
        setMessages(prev => [
          ...prev,
          { type: "bot", content: aiRes.response }
        ]);
        return;
      }
      // AI 응답을 프론트엔드 메시지 형식으로 변환
      const convertBackendMessageToFrontend = (aiRes: any) => {
        
        let botMessage: ChatMessage;
        
        if (aiRes.videoUrl || (aiRes as any).video_url) {
          const videoUrl = aiRes.videoUrl || (aiRes as any).video_url;
          const videoId = getYoutubeId(videoUrl);
          const iframeSrc = `https://www.youtube.com/embed/${videoId}`;
          botMessage = {
            type: "bot",
            content: (
              <div>
                <iframe
                  width="320"
                  height="180"
                  src={iframeSrc}
                  title={aiRes.videoTitle || (aiRes as any).video_title || "추천 영상"}
                  style={{ border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded mb-2"
                ></iframe>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiRes.response}</ReactMarkdown>
                <button
                  onClick={() => handleCommentSummary(videoUrl)}
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  📊 댓글 요약 보기
                </button>
              </div>
            )
          };
        } else {
          botMessage = {
            type: "bot",
            content: <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiRes.response}</ReactMarkdown>
          };
        }
        
        return botMessage;
      };

      const botMessage = convertBackendMessageToFrontend(aiRes);
      
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        { type: "bot", content: "AI 챗봇 응답에 실패했습니다. 다시 시도해 주세요." }
      ]);
    }
  };

  // 부모에서 maximize/minimize 제어 가능
  useImperativeHandle(ref, () => ({
    maximize: () => setIsMinimized(false),
    minimize: () => setIsMinimized(true),
  }));

  // isOpen이 true가 될 때마다 minimized로 초기화
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(true);
    }
  }, [isOpen]);

  // 헤더 클릭 시 minimized/maximized 토글
  const handleHeaderClick = () => {
    setIsMinimized((prev) => !prev);
  };

  // messages가 바뀔 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={`
        fixed z-50 bg-white shadow-xl border border-gray-200 transition-all duration-300 flex flex-col
        left-0 top-0 w-screen h-screen rounded-none
        sm:left-auto sm:top-auto sm:right-[6.5rem] sm:bottom-6 sm:rounded-xl
        ${isMinimized
          ? 'sm:w-100 sm:h-150'
          : 'sm:w-[1000px] sm:h-[800px]'
        }
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      {/* 헤더: 타이틀, 닫기 버튼, 클릭 시 크기 토글 */}
      <div className="flex justify-between items-center p-4 border-b cursor-pointer select-none" onClick={handleHeaderClick} title="클릭 시 크기 전환">
        <span className="font-semibold text-lg">Synergym AI</span>
        <button onClick={e => { e.stopPropagation(); onClose(); }}>
          <X className="w-5 h-5 text-gray-600 hover:text-black" />
        </button>
      </div>
      {/* 메시지 영역 */}
      <div
        ref={messagesEndRef}
        className="p-4 flex-1 overflow-y-auto text-sm text-gray-700 flex flex-col"
      >
        {messages.map((msg, idx) => {
          if (msg.type === "bot" && typeof msg.content === "string" && msg.content.startsWith("[운동영상]")) {
            const videoId = "fFIL0rlRH78";
            const messageText = msg.content.replace("[운동영상]", "").trim();
            return (
              <div key={idx} className="flex items-end gap-2 mb-4">
                <div className="flex flex-col items-start">
                  <div className="bg-blue-100 text-gray-800 rounded-2xl px-4 py-3 max-w-[420px] shadow-sm relative">
                    <div>
                      <iframe
                        width="320"
                        height="180"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        style={{ border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded mb-2"
                      ></iframe>
                      <div>{messageText}</div>
                      <button
                        onClick={() => handleCommentSummary(`https://www.youtube.com/watch?v=${videoId}`)}
                        className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        📊 댓글 요약 보기
                      </button>
                    </div>
                  </div>
                  <HiUser className="w-7 h-7 text-blue-400 mt-1 ml-2" />
                </div>
              </div>
            );
          }
          return msg.type === 'bot' ? (
            <div key={idx} className="flex items-end gap-2 mb-4">
              <div className="flex flex-col items-start">
                <div className="bg-blue-100 text-gray-800 rounded-2xl px-4 py-3 max-w-[420px] shadow-sm relative">
                  {msg.content}
                </div>
                {/* bot 메시지 하단에 루틴 추가 버튼 표시 */}
                {recommendedExerciseName && (
                  <div className="flex gap-2 mt-2 ml-2">
                    <button 
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm" 
                      onClick={handleAddToNewRoutine}
                    >
                      신규 루틴에 추가
                    </button>
                    <button 
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm" 
                      onClick={handleShowRoutineSelect}
                    >
                      기존 루틴에 추가
                    </button>
                  </div>
                )}
                <HiUser className="w-7 h-7 text-blue-400 mt-1 ml-2" />
              </div>
            </div>
          ) : (
            <div key={idx} className="flex items-end gap-2 mb-4 justify-end">
              <div className="flex flex-col items-end">
                <div className="bg-blue-500 text-white rounded-2xl px-4 py-3 max-w-[420px] shadow-sm relative">
                  {msg.content}
                </div>
                <HiUser className="w-7 h-7 text-blue-500 mt-1 mr-2 self-end" />
              </div>
            </div>
          );
        })}
        {isLoading && (
  <div className="flex items-center gap-2 text-blue-500 py-2">
    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
    AI 코치가 답변을 생성 중입니다...
  </div>
)}
      </div>
      {/* 입력창/전송 폼 */}
      <form
        className="flex items-center border-t p-3 gap-2"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => {
            setIsMinimized(false); // 입력창 포커스 시 maximize
            if (onInputFocus) onInputFocus();
          }}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          전송
        </button>
      </form>
    </div>
  );
});

export default ChatModal;