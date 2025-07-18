import { X } from "lucide-react";
import { HiUser } from "react-icons/hi";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  getActiveSession,
  getChatHistory,
  sendChatMessage,
  type ChatMessageDTO,
  type ChatRequestDTO,
  type ChatResponseDTO
} from "../../services/api/chatbotApi";
import { useUserStore } from "../../store/userStore";

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

function convertBackendMessageToFrontend(msg: ChatMessageDTO): ChatMessage {
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
          <div>{msg.content}</div>
        </div>
      ),
      timestamp: msg.timestamp
    };
  }
  return {
    type: msg.type as "user" | "bot",
    content: msg.content,
    timestamp: msg.timestamp
  };
}

function createInitialMessage(type: 'video' | 'consult', payload: any, response: string): ChatMessage | null {
  if (type === "video") {
    const videoId = getYoutubeId(payload.videoUrl);
    return {
      type: "bot",
      content: (
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
          <div>{response}</div>
        </div>
      ),
    };
  } else if (type === "consult") {
    return { type: "bot", content: response };
  }
  return null;
}

const ChatModal = forwardRef<any, Props>(({ isOpen, onClose, initType, initPayload, onInputFocus, userId, historyId, initialUserMessage, initialVideoUrl }, ref) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const { user } = useUserStore();
  const [isMinimized, setIsMinimized] = useState(true);
  const [initialRequestSent, setInitialRequestSent] = useState(false);

  // userId가 바뀌면 상태 초기화
  useEffect(() => {
    setSessionId("");
    setMessages([]);
    setInput("");
    setIsMinimized(true);
    setInitialRequestSent(false);
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

  // 챗봇 오픈 시 세션/대화 내역 로드
  useEffect(() => {
    if (!isOpen || !userId) return;
    let isMounted = true;
    loadSessionAndHistory().then((sid) => {
      if (isMounted && sid) {
        // 세션 로드 완료 후 초기 메시지 추가는 별도 useEffect에서 처리
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
      !initialRequestSent &&
      (initialUserMessage || initialVideoUrl)
    ) {
      setInitialRequestSent(true);
      const message = initialUserMessage || (initType === 'video' ? '추천 영상 보여줘' : '운동 추천해줘');
      const payload: ChatRequestDTO = {
        type: initType === 'video' ? 'recommend_video' : 'ai_coach',
        userId,
        historyId,
        message,
      };
      sendChatMessage(payload).then(aiRes => {
        const userMsg: ChatMessage = { type: 'user', content: message };
        let botMsg: ChatMessage = { type: 'bot', content: aiRes.response };
        if (aiRes.videoUrl) {
          botMsg = {
            type: 'bot',
            content: (
              <div>
                <iframe
                  width="320"
                  height="180"
                  src={aiRes.videoUrl.replace('watch?v=', 'embed/')}
                  title={aiRes.videoTitle || "추천 영상"}
                  style={{ border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded mb-2"
                ></iframe>
                <div>{aiRes.videoTitle || aiRes.response}</div>
              </div>
            )
          };
        }
        setMessages([userMsg, botMsg]);
      });
    }
  }, [isOpen, userId, historyId, initialUserMessage, initialVideoUrl, initType, initialRequestSent]);

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
    if (!input.trim() || !userId || !historyId) return;
    setMessages(prev => [...prev, { type: "user", content: input }]);
    setInput("");
    const payload: ChatRequestDTO = {
      type: initType === 'video' ? 'recommend_video' : 'ai_coach',
      userId,
      historyId,
      message: input,
    };
    try {
      const aiRes = await sendChatMessage(payload);
      setMessages(prev => [
        ...prev,
        { type: "bot", content: aiRes.response },
        ...(aiRes.videoUrl ? [{
          type: "bot" as const,
          content: (
            <div>
              <iframe
                width="320"
                height="180"
                src={aiRes.videoUrl.replace('watch?v=', 'embed/')}
                title={aiRes.videoTitle || "추천 영상"}
                style={{ border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded mb-2"
              ></iframe>
              <div>{aiRes.videoTitle}</div>
            </div>
          )
        }] : []) as ChatMessage[]
      ]);
    } catch (e) {
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
      <div className="p-4 flex-1 overflow-y-auto text-sm text-gray-700 flex flex-col">
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