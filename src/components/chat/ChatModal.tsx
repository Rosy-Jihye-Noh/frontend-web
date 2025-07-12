import { X } from "lucide-react";
import { HiUser } from "react-icons/hi";
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"; // useRef를 import 합니다.
import axiosInstance from "../../api/axiosInstance";
import { useUserStore } from "../../store/userStore";

/**
 * SynergyM AI 챗봇 모달 컴포넌트
 * - 챗봇/사용자 메시지 UI
 * - 유튜브 영상 추천, 상담 등 다양한 초기 메시지 지원
 * - 입력창/전송, 닫기 버튼 제공
 */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initType?: 'video' | 'consult' | null;
  initPayload?: any;
  onInputFocus?: () => void;
}

interface ChatMessage {
  type: "user" | "bot";
  content: React.ReactNode;
  timestamp?: string;
}

// 유튜브 URL에서 영상 ID 추출 (googleusercontent URL 형식 지원 추가)
function getYoutubeId(url: string) {
  const match = url.match(/(?:v=|be\/|embed\/|googleusercontent.com\/youtube.com\/)([\w-]{11}|\d+)/);
  return match ? match[1] : '';
}

// 전역 챗봇 오픈 함수 타입 정의
type OpenChatbotFunction = (type: 'video' | 'consult', payload?: any) => void;

// 전역 챗봇 상태 관리
let globalChatbotState: {
  isOpen: boolean;
  initType: 'video' | 'consult' | null;
  initPayload: any;
  onClose: (() => void) | null;
} = {
  isOpen: false,
  initType: null,
  initPayload: null,
  onClose: null
};

// 전역 챗봇 오픈 함수
const openChatbot: OpenChatbotFunction = (type: 'video' | 'consult', payload?: any) => {
  console.log('ChatModal: openChatbot called with type:', type);
  
  if (type === 'video') {
    const videoPayload = {
      videoUrl: 'https://www.youtube.com/watch?v=fFIL0rlRH78',
      thumbnail: 'https://img.youtube.com/vi/fFIL0rlRH78/0.jpg',
      message: '스크립트 요약과 댓글의 분석이 필요할 경우 요청주세요.'
    };
    console.log('ChatModal: Setting video payload:', videoPayload);
    globalChatbotState = {
      isOpen: true,
      initType: 'video',
      initPayload: videoPayload,
      onClose: globalChatbotState.onClose
    };
  } else if (type === 'consult') {
    const consultPayload = {
      message: 'OOO 운동을 추천드립니다. 루틴에 추가하시겠습니까?'
    };
    console.log('ChatModal: Setting consult payload:', consultPayload);
    globalChatbotState = {
      isOpen: true,
      initType: 'consult',
      initPayload: consultPayload,
      onClose: globalChatbotState.onClose
    };
  }
  
  console.log('ChatModal: Dispatching event with payload:', globalChatbotState.initPayload);
  // 전역 상태 변경을 알리는 이벤트 발생
  window.dispatchEvent(new CustomEvent('chatbotStateChanged', { 
    detail: { type, payload: globalChatbotState.initPayload } 
  }));
  
  // 전역 상태를 window 객체에 업데이트
  if (typeof window !== 'undefined') {
    (window as any).globalChatbotState = globalChatbotState;
  }
};

// window 객체에 함수 등록
if (typeof window !== 'undefined') {
  (window as any).openChatbot = openChatbot;
  (window as any).globalChatbotState = globalChatbotState;
}

const ChatModal = forwardRef<any, Props>(({ isOpen, onClose, initType, initPayload, onInputFocus }, ref) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const { user } = useUserStore();
  const userId = user?.id;
  // 챗봇 크기 상태: 처음엔 작게, 입력창 포커스 시 커짐
  const [isMinimized, setIsMinimized] = useState(true);
  console.log('[ChatModal] user:', user, 'userId:', userId);

  // === [수정] 로그아웃/로그인 시 전역 상태 및 내부 상태 초기화 ===
  useEffect(() => {
    // user가 null(로그아웃)되거나 userId가 바뀔 때마다 상태 초기화
    if (!userId) {
      setSessionId("");
      setMessages([]);
      // 전역 상태도 초기화
      globalChatbotState = {
        isOpen: false,
        initType: null,
        initPayload: null,
        onClose: null
      };
      if (typeof window !== 'undefined') {
        (window as any).globalChatbotState = globalChatbotState;
        (window as any).openChatbot = openChatbot;
      }
    }
  }, [userId]);

  // userId가 바뀌거나 챗봇이 열릴 때마다 sessionId를 받아오고, 이후 모든 API에 이 sessionId를 사용
  useEffect(() => {
    if (!isOpen || !userId) return;
    // === 핵심 로그: 챗봇 오픈 트리거 정보와 실제 세션 정보만 출력 ===
    console.log('[ChatModal][OPEN] Triggered by:', {
      initType,
      initPayload,
      globalChatbotState,
      userId
    });
    let isMounted = true;
    const fetchSessionAndHistory = async () => {
      try {
        const res = await axiosInstance.get(`/chatbot/active-session/${userId}`);
        const sid = res.data;
        // 핵심 로그: 실제로 불러오는 세션 정보
        console.log('[ChatModal][SESSION] userId:', userId, 'sessionId:', sid, 'Redis key:', `chat:session:${userId}:${sid}`);
        if (isMounted) setSessionId(sid);
        if (sid) {
          const historyRes = await axiosInstance.get(`/chatbot/history/${userId}/${sid}`);
          const historyData = historyRes.data || [];
          setMessages(historyData.map((msg: any) => ({ type: msg.type, content: msg.content, timestamp: msg.timestamp })));
        } else {
          setMessages([]);
        }
      } catch (error) {
        setMessages([]);
      }
    };
    fetchSessionAndHistory();
    return () => { isMounted = false; };
  }, [isOpen, userId, initType, initPayload]);

  // 안내 메시지 강제 추가 함수 (백엔드에 저장)
  const forceAddMessage = async (type: 'video' | 'consult', payload: any) => {
    if (!userId) return;
    let sid = sessionId;
    // sessionId가 없으면 먼저 받아온다
    if (!sid) {
      try {
        const res = await axiosInstance.get(`/chatbot/active-session/${userId}`);
        sid = res.data;
        setSessionId(sid);
      } catch (e) {
        console.error('forceAddMessage: sessionId를 받아오지 못함', e);
        return;
      }
    }
    let content = '';
    let videoUrl = '';
    if (type === 'video') {
      content = payload.message;
      videoUrl = payload.videoUrl;
    } else if (type === 'consult') {
      content = payload.message;
    }
    try {
      // 백엔드에 저장
      const res = await axiosInstance.post('/chatbot/force-message', {
        userId,
        sessionId: sid,
        message: type,
        content,
        videoUrl,
      });
      console.log('forceAddMessage: 메시지 추가 성공', res.data);

      // sessionId가 새로 생성되었으면 반드시 갱신
      if (res.data.sessionId && res.data.sessionId !== sid) {
        setSessionId(res.data.sessionId);
        sid = res.data.sessionId;
        console.log('forceAddMessage: sessionId 갱신됨', sid);
      }
      // 메시지 추가 후 최신 대화 내역 불러오기 (항상 최신 sessionId 사용)
      const historyRes = await axiosInstance.get(`/chatbot/history/${userId}/${sid}`);
      const historyData = historyRes.data || [];
      const convertedMessages: ChatMessage[] = historyData.map((msg: any) => {
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
          };
        }
        return { type: msg.type, content: msg.content };
      });
      setMessages(convertedMessages);
    } catch (e) {
      console.error('forceAddMessage: 메시지 추가 실패', e);
    }
  };

  // Ref를 사용하여 히스토리 로드 여부와 마지막으로 처리한 payload를 추적합니다.
  const historyLoadedRef = useRef(false);
  const lastPayloadRef = useRef<any>(null);

  // userId가 바뀌면(로그아웃/로그인) 챗봇 상태를 완전히 초기화합니다.
  useEffect(() => {
    setSessionId("");
    setMessages([]);
    historyLoadedRef.current = false;
    lastPayloadRef.current = null;
  }, [userId]);

  // 모달이 닫힐 때 상태를 초기화하여, 다음에 열릴 때 깨끗한 상태에서 시작하도록 합니다.
  useEffect(() => {
    if (!isOpen) {
      historyLoadedRef.current = false;
      lastPayloadRef.current = null;
    }
  }, [isOpen]);

  // onClose 함수를 전역 상태에 저장
  useEffect(() => {
    globalChatbotState.onClose = onClose;
  }, [onClose]);

  // 대화 불러오기 및 초기 메시지 추가 로직
  useEffect(() => {
    if (!isOpen || !userId) {
      return;
    }

    // 1. 히스토리를 로드하는 비동기 함수
    const loadHistory = async () => {
      if (!historyLoadedRef.current) {
        historyLoadedRef.current = true; // 중복 로드를 방지하기 위해 플래그를 즉시 설정
        try {
          const res = await axiosInstance.get(`/chatbot/active-session/${userId}`);
          const sid = res.data;
          setSessionId(sid);
          if (sid) {
            const historyRes = await axiosInstance.get(`/chatbot/history/${userId}/${sid}`);
            const historyData = historyRes.data || [];
            console.log('Loaded chat history:', historyData);
            
            // 백엔드에서 받은 메시지를 프론트엔드 형식으로 변환
            const convertedMessages: ChatMessage[] = historyData.map((msg: any) => ({
              type: msg.type,
              content: msg.content,
              timestamp: msg.timestamp
            }));
            
            setMessages(convertedMessages);
            
            // 히스토리 로드 후 초기 메시지 추가 로직 실행
            await addInitialMessage(convertedMessages);
          } else {
            // 세션이 없으면 초기 메시지 추가
            await addInitialMessage([]);
          }
        } catch (error) {
          console.error("Failed to load chat history:", error);
          setMessages([]);
          // 에러 발생 시에도 초기 메시지 추가
          await addInitialMessage([]);
        }
      }
    };

    // 2. 초기 메시지를 추가하는 함수
    const addInitialMessage = async (currentMessages: ChatMessage[]) => {
      // props로 전달된 payload와 type을 우선 사용
      const payload = initPayload || globalChatbotState.initPayload;
      const type = initType || globalChatbotState.initType;
      
      console.log('=== DEBUG INFO ===');
      console.log('initPayload:', initPayload);
      console.log('initType:', initType);
      console.log('globalChatbotState:', globalChatbotState);
      console.log('Adding initial message:', { type, payload, lastPayload: lastPayloadRef.current, currentMessagesLength: currentMessages.length });
      
      // payload나 type이 없으면 건너뛰기
      if (!payload || !type) {
        console.log('Skipping - no payload or type available');
        return;
      }
      
      // 새로운 payload가 있고, 이전에 처리한 payload와 다를 경우에만 메시지를 추가
      if (payload !== lastPayloadRef.current) {
        lastPayloadRef.current = payload; // payload를 처리했다고 기록

        // 현재 메시지 개수 확인 (대화 내역이 없을 때만 초기 메시지 추가)
        const currentMessageCount = currentMessages.length;
        console.log('Current message count:', currentMessageCount);
        
        // 대화 내역이 없을 때만 초기 메시지 추가
        if (currentMessageCount === 0) {
          try {
            // 백엔드에 초기 메시지 저장 요청
            const response = await axiosInstance.post("/chatbot/init-message", {
              userId,
              sessionId,
              message: type // "video" 또는 "consult"
            });

            if (response.data && response.data.response) {
              // 백엔드에서 받은 메시지를 화면에 표시
              let newMessage: ChatMessage | null = null;
              
              if (type === "video") {
                const videoId = getYoutubeId(payload.videoUrl);
                newMessage = {
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
                      <div>{response.data.response}</div>
                    </div>
                  ),
                };
              } else if (type === "consult") {
                newMessage = { type: "bot", content: response.data.response };
              }

              if (newMessage) {
                setMessages(prev => [...prev, newMessage!]);
              }
            }
          } catch (error) {
            console.error("Failed to save initial message:", error);
            // 백엔드 호출 실패 시 로컬에서 메시지 추가
            let newMessage: ChatMessage | null = null;
            if (type === "video") {
              const videoId = getYoutubeId(payload.videoUrl);
              newMessage = {
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
                    <div>{payload.message}</div>
                  </div>
                ),
              };
            } else if (type === "consult") {
              newMessage = { type: "bot", content: payload.message };
            }

            if (newMessage) {
              setMessages(prev => [...prev, newMessage!]);
            }
          }
        } else {
          console.log('Skipping initial message - conversation already exists');
        }
      }
    };

    // 3. 히스토리 로드 실행
    loadHistory();

  }, [isOpen, userId, initType, initPayload]);

  useEffect(() => {
    (window as any).forceAddChatbotMessage = forceAddMessage;
    return () => {
      (window as any).forceAddChatbotMessage = undefined;
    };
  }, []);

  // 메시지 전송 핸들러 (입력값을 사용자 메시지로 추가 후 초기화)
  const handleSend = async () => {
    if (!input.trim() || !userId) {
      console.log("input or userId missing", input, userId);
      return;
    }
    const userMsg: ChatMessage = { type: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axiosInstance.post("/chatbot/send", {
        userId,
        sessionId,
        message: input,
      });
      setMessages(prev => [
        ...prev,
        { type: "bot", content: res.data.response },
      ]);
      if (res.data.sessionId) setSessionId(res.data.sessionId);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { type: "bot", content: "오류가 발생했습니다." },
      ]);
    }
  };

  useEffect(() => {
    console.log('messages:', messages);
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !userId) return;
    console.log('[ChatModal] useEffect - isOpen:', isOpen, 'userId:', userId, 'sessionId:', sessionId);
  }, [isOpen, userId, sessionId]);

  // expose maximize/minimize methods to parent
  useImperativeHandle(ref, () => ({
    maximize: () => setIsMinimized(false),
    minimize: () => setIsMinimized(true),
  }));

  // 챗봇이 열릴 때마다 minimized로 초기화
  useEffect(() => {
    if (isOpen) setIsMinimized(true);
  }, [isOpen]);

  // ... 이하 렌더링(JSX) 부분은 기존 코드와 동일합니다 ...
  return (
    <div
      className={`
        fixed z-50 bg-white shadow-xl border border-gray-200 transition-all duration-300 flex flex-col
        left-0 top-0 w-screen h-screen rounded-none
        sm:left-auto sm:top-auto sm:right-[6.5rem] sm:bottom-6 sm:rounded-xl
        ${isMinimized
          ? 'sm:w-100 sm:h-150' // minimized desktop
          : 'sm:w-[1000px] sm:h-[800px]' // maximized desktop
        }
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      {/* 헤더: 타이틀, 닫기 버튼 */}
      <div className="flex justify-between items-center p-4 border-b">
        <span className="font-semibold text-lg">Synergym AI</span>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-600 hover:text-black" />
        </button>
      </div>
      {/* 메시지 영역 */}
      <div className="p-4 flex-1 overflow-y-auto text-sm text-gray-700 flex flex-col">
        {/* 메시지 렌더링 */}
        {messages.map((msg, idx) => {
          // [운동영상]으로 시작하면 iframe+문구로 변환
          if (msg.type === "bot" && typeof msg.content === "string" && msg.content.startsWith("[운동영상]")) {
            // 실제로는 videoUrl을 저장해야 더 정확하지만, 지금은 텍스트만 있으므로 임시로 하드코딩
            const videoId = "fFIL0rlRH78"; // 실제로는 백엔드에서 videoUrl도 저장해야 함
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
          // 일반 bot/user 메시지는 기존대로
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
            setIsMinimized(false);
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