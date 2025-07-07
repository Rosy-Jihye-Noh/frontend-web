import { X } from "lucide-react";
import { HiUser } from "react-icons/hi";
import { useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initType?: 'video' | 'consult' | null;
  initPayload?: any;
}

interface ChatMessage {
  type: 'bot' | 'user';
  content: React.ReactNode;
}

function getYoutubeId(url: string) {
  const match = url.match(/(?:v=|be\/|embed\/)([\w-]{11})/);
  return match ? match[1] : '';
}

const ChatModal = ({ isOpen, onClose, initType, initPayload }: Props) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    let initial: ChatMessage[] = [];
    if (initType === 'video' && initPayload) {
      const videoId = getYoutubeId(initPayload.videoUrl);
      initial.push({
        type: 'bot',
        content: (
          <>
            <div className="mb-2">
              <iframe
                width="320"
                height="180"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded mb-2"
              ></iframe>
            </div>
            <span className="underline text-blue-600 text-xs">추천 운동 영상 바로 시청</span>
            <div className="mb-1 text-xs text-gray-600">{initPayload.message}</div>
          </>
        )
      });
    } else if (initType === 'consult' && initPayload) {
      initial.push({ type: 'bot', content: <div>{initPayload.message}</div> });
    } else {
      initial.push({ type: 'bot', content: <div>💬 어디가 불편하신가요?</div> });
    }
    setMessages(initial);
  }, [isOpen, initType, initPayload]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages(prev => [
        ...prev,
        { type: 'user', content: <div>{input}</div> }
      ]);
      setInput("");
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 mx-auto z-50 bg-white rounded-xl shadow-xl border border-gray-200 transition-all duration-300 flex flex-col
        w-full h-[90vh] min-w-[0] min-h-[320px] max-w-full max-h-[100vh]
        sm:w-[90vw] sm:h-[80vh] sm:max-w-[700px] sm:max-h-[700px]
        md:w-[66vw] md:h-[80vh] md:max-w-[1100px] md:max-h-[900px]
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <span className="font-semibold text-lg">Gymmie</span>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-600 hover:text-black" />
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto text-sm text-gray-700 flex flex-col">
        {/* 메시지 렌더링 */}
        {messages.map((msg, idx) =>
          msg.type === 'bot' ? (
            <div key={idx} className="flex items-end gap-2 mb-4">
              <div className="flex flex-col items-start">
                <div className="bg-blue-100 text-gray-800 rounded-2xl px-4 py-3 max-w-[420px] shadow-sm relative">
                  {msg.content}
                </div>
                {/* 챗봇(사람) 아이콘 - 말풍선 아래 왼쪽 */}
                <HiUser className="w-7 h-7 text-blue-400 mt-1 ml-2" />
              </div>
            </div>
          ) : (
            <div key={idx} className="flex items-end gap-2 mb-4 justify-end">
              <div className="flex flex-col items-end">
                <div className="bg-blue-500 text-white rounded-2xl px-4 py-3 max-w-[420px] shadow-sm relative">
                  {msg.content}
                </div>
                {/* 내(사람) 아이콘 - 말풍선 아래 오른쪽 */}
                <HiUser className="w-7 h-7 text-blue-500 mt-1 mr-2 self-end" />
              </div>
            </div>
          )
        )}
      </div>
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
