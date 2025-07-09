import { useState, forwardRef, useImperativeHandle } from "react";
import ChatButton from "./ChatButton";
import ChatModal from "./ChatModal";
import TopButton from "./TopButton";

const Chatbot = forwardRef((props, ref) => {
  const [isChatOpen, setIsChatOpen] = useState(false); // 챗봇 모달의 열림 여부 상태
  const [initType, setInitType] = useState<'video' | 'consult' | null>(null); // 초기 대화 타입 ('video' 또는 'consult')
  const [initPayload, setInitPayload] = useState<any>(null); // 초기 대화에 전달할 추가 데이터 (선택 사항)

  // 부모 컴포넌트에서 Chatbot을 제어할 수 있도록 핸들러 등록
  useImperativeHandle(ref, () => ({
    open: (type: 'video' | 'consult', payload?: any) => { // 외부에서 open(type, payload)으로 챗봇 모달 열기 가능
      setInitType(type); // 초기 타입 설정
      setInitPayload(payload); // 초기 페이로드 설정
      setIsChatOpen(true); // 모달 열기
    }
  }));

  return (
    <>
      {/* 챗봇 모달 컴포넌트: 상태에 따라 열리고 초기 타입/페이로드 전달 */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initType={initType}
        initPayload={initPayload}
      />
      {/* 화면 우측 하단에 표시되는 챗봇 열기 버튼 */}
      <ChatButton onClick={() => setIsChatOpen(true)} />
      {/* 최상단으로 이동하는 버튼 */}
      <TopButton />
    </>
  );
});

export default Chatbot;
