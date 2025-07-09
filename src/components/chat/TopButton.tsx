import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

/**
 * 페이지 하단에 표시되는 '맨 위로 이동' 버튼 컴포넌트
 * - 스크롤이 페이지 중간 이상 내려가면 버튼 표시
 * - 클릭 시 부드럽게 페이지 최상단으로 이동
 */
const TopButton = () => {
  const [visible, setVisible] = useState(false);

    // 스크롤 위치에 따라 버튼 표시 여부 결정
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const threshold = document.documentElement.scrollHeight / 2;
      setVisible(scrollTop > threshold);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 버튼 클릭 시 페이지 최상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      onClick={scrollToTop}
      variant="default"
      size="icon"
      className={`fixed bottom-28 right-6 w-16 h-16 rounded-full shadow-lg z-50 transition-opacity duration-300 bg-blue-500 hover:bg-blue-600 text-white ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-6 h-6" />
    </Button>
  );
};

export default TopButton;
