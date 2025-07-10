import { X } from "lucide-react";
import { HiUser } from "react-icons/hi";
import { useState, useEffect, useRef } from "react"; // useRef를 import 합니다.
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

const ChatModal = ({ isOpen, onClose, initType, initPayload }: Props) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const { user } = useUserStore();
  const userId = user?.id;

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
            setMessages(historyRes.data || []);
          }
        } catch (error) {
          console.error("Failed to load chat history:", error);
          setMessages([]);
        }
      }
    };

    // 2. 초기 메시지를 추가하는 함수
    const addInitialMessage = () => {
      // 새로운 payload가 있고, 이전에 처리한 payload와 다를 경우에만 메시지를 추가
      if (initPayload && initPayload !== lastPayloadRef.current) {
        lastPayloadRef.current = initPayload; // payload를 처리했다고 기록

        let newMessage: ChatMessage | null = null;
        if (initType === "video") {
          const videoId = getYoutubeId(initPayload.videoUrl);
          newMessage = {
            type: "bot",
            content: (
              <div>
                <iframe
                  width="320"
                  height="180"
                  src={`https://www.youtube.com/embed/${videoId}`} // 표준 embed URL을 사용합니다.
                  title="YouTube video player"
                  style={{ border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded mb-2"
                ></iframe>
                <div>{initPayload.message}</div>
              </div>
            ),
          };
        } else if (initType === "consult") {
          newMessage = { type: "bot", content: initPayload.message };
        }

        if (newMessage) {
          setMessages(prev => [...prev, newMessage!]);
        }
      }
    };

    // 3. 히스토리 로드를 먼저 실행하고, 완료된 후에 초기 메시지를 추가하여 순서를 보장합니다.
    loadHistory().then(() => {
      addInitialMessage();
    });

  }, [isOpen, userId, initType, initPayload]);

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

  // ... 이하 렌더링(JSX) 부분은 기존 코드와 동일합니다 ...
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 mx-auto z-50 bg-white rounded-xl shadow-xl border border-gray-200 transition-all duration-300 flex flex-col
        w-full h-[90vh] min-w-[0] min-h-[320px] max-w-full max-h-[100vh]
        sm:w-[90vw] sm:h-[80vh] sm:max-w-[700px] sm:max-h-[700px]
        md:w-[66vw] md:h-[80vh] md:max-w-[1100px] md:max-h-[900px]
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
    >
      {/* 헤더: 타이틀, 닫기 버튼 */}
      <div className="flex justify-between items-center p-4 border-b">
        <span className="font-semibold text-lg">SynergyM AI</span>
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
};

export default ChatModal;