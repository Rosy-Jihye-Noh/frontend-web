import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const TopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const threshold = document.documentElement.scrollHeight / 2;
      setVisible(scrollTop > threshold);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
