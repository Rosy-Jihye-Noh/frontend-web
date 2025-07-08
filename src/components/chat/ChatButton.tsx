import { HiChatAlt2 } from "react-icons/hi";

interface Props {
  onClick: () => void;
}

const ChatButton = ({ onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg z-50 flex items-center justify-center transition-all"
    >
      <HiChatAlt2 className="w-8 h-8" />
    </button>
  );
};

export default ChatButton;
