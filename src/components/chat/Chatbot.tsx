import { useState, forwardRef, useImperativeHandle } from "react";
import ChatButton from "./ChatButton";
import ChatModal from "./ChatModal";
import TopButton from "./TopButton";

const Chatbot = forwardRef((props, ref) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initType, setInitType] = useState<'video' | 'consult' | null>(null);
  const [initPayload, setInitPayload] = useState<any>(null);

  useImperativeHandle(ref, () => ({
    open: (type: 'video' | 'consult', payload?: any) => {
      setInitType(type);
      setInitPayload(payload);
      setIsChatOpen(true);
    }
  }));

  return (
    <>
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initType={initType}
        initPayload={initPayload}
      />
      <ChatButton onClick={() => setIsChatOpen(true)} />
      <TopButton />
    </>
  );
});

export default Chatbot;
