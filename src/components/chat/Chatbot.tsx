import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import ChatButton from "./ChatButton";
import ChatModal from "./ChatModal";
import TopButton from "./TopButton";
import { useLocation } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import { useRef } from "react";

const Chatbot = forwardRef((props, ref) => {
  const [isChatOpen, setIsChatOpen] = useState(false); // 챗봇 모달의 열림 여부 상태
  const [initType, setInitType] = useState<'video' | 'consult' | null>(null); // 초기 대화 타입 ('video' 또는 'consult')
  const [initPayload, setInitPayload] = useState<any>(null); // 초기 대화에 전달할 추가 데이터 (선택 사항)
  const location = useLocation();
  const { user } = useUserStore();
  const prevLocation = useRef(location.pathname);
  const chatModalRef = useRef<any>(null);

  // 부모 컴포넌트에서 Chatbot을 제어할 수 있도록 핸들러 등록
  useImperativeHandle(ref, () => ({
    open: (type: 'video' | 'consult', payload?: any) => { // 외부에서 open(type, payload)으로 챗봇 모달 열기 가능
      setInitType(type); // 초기 타입 설정
      setInitPayload(payload); // 초기 페이로드 설정
      setIsChatOpen(true); // 모달 열기
      setTimeout(() => {
        chatModalRef.current?.maximize();
      }, 0);
    }
  }));

  // 전역 챗봇 이벤트 감지
  useEffect(() => {
    const handleChatbotStateChange = (event: CustomEvent) => {
      console.log('Chatbot: Received chatbotStateChanged event:', event.detail);
      if (event.detail && event.detail.type) {
        setInitType(event.detail.type);
        
        // 현재 사용자와 이벤트의 사용자가 일치하는지 확인
        const eventUserId = event.detail.userId;
        const currentUserId = user?.id;
        
        if (eventUserId === currentUserId && currentUserId) {
          // 전역 상태에서 payload 가져오기
          const globalStates = (window as any).globalChatbotStates;
          let payload = null;
          
          if (event.detail.payload) {
            payload = event.detail.payload;
          } else if (globalStates && globalStates[currentUserId] && globalStates[currentUserId].initPayload) {
            payload = globalStates[currentUserId].initPayload;
          }
          
          console.log('Chatbot: Setting payload from event:', payload);
          console.log('Chatbot: Global states:', globalStates);
          setInitPayload(payload);
          setIsChatOpen(true);
          setTimeout(() => {
            chatModalRef.current?.maximize();
          }, 0);
        } else {
          console.log('Chatbot: Ignoring event from different user:', eventUserId, 'current:', currentUserId);
        }
      }
    };

    window.addEventListener('chatbotStateChanged', handleChatbotStateChange as EventListener);
    return () => {
      window.removeEventListener('chatbotStateChanged', handleChatbotStateChange as EventListener);
    };
  }, [user?.id]);

  // 페이지 이동 시 챗봇 최소화
  useEffect(() => {
    if (isChatOpen && prevLocation.current !== location.pathname) {
      chatModalRef.current?.minimize();
      prevLocation.current = location.pathname;
    }
  }, [location, isChatOpen]);

  // 로그아웃 시 챗봇 닫기 및 상태 초기화
  useEffect(() => {
    if (!user && isChatOpen) {
      setIsChatOpen(false);
      setInitType(null);
      setInitPayload(null);
    }
  }, [user, isChatOpen]);

  // 사용자 변경 시 상태 초기화
  useEffect(() => {
    if (user?.id) {
      // 새로운 사용자 로그인 시 상태 초기화
      setInitType(null);
      setInitPayload(null);
    }
  }, [user?.id]);

  // 모달이 닫힐 때 상태 초기화 (대화 내용은 유지)
  const handleClose = () => {
    setIsChatOpen(false);
    
    // initType과 initPayload는 초기화 (다음에 열 때 새로운 대화를 위해)
    setInitType(null);
    setInitPayload(null);
    
    // 모달이 닫힐 때 현재 사용자의 전역 상태에서 isOpen만 false로 설정
    // 대화 내용(initType, initPayload)은 유지하여 다음에 열 때 이어서 대화 가능
    if (typeof window !== 'undefined' && user?.id) {
      const globalStates = (window as any).globalChatbotStates;
      if (globalStates && globalStates[user.id]) {
        globalStates[user.id] = {
          ...globalStates[user.id],
          isOpen: false,
          onClose: null
        };
        (window as any).globalChatbotStates = globalStates;
      }
    }
  };

  // 챗봇 아이콘 클릭 시 토글 동작 (열려있으면 닫고, 닫혀있으면 열고 최대화)
  const handleChatButtonClick = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
    } else {
      setIsChatOpen(true);
      setTimeout(() => {
        chatModalRef.current?.maximize();
      }, 0);
    }
  };

  return (
    <>
      {/* 챗봇 모달 컴포넌트: 상태에 따라 열리고 초기 타입/페이로드 전달 */}
      <ChatModal
        ref={chatModalRef}
        isOpen={isChatOpen}
        onClose={handleClose}
        initType={initType}
        initPayload={initPayload}
        onInputFocus={() => chatModalRef.current?.maximize()}
      />
      {/* 모바일에서는 챗봇이 열려있을 때 버튼 숨김, 데스크탑은 항상 표시 */}
      <div className={`${isChatOpen ? 'hidden' : ''} sm:block`}>
        <ChatButton onClick={handleChatButtonClick} />
        <TopButton />
      </div>
    </>
  );
});

export default Chatbot;
