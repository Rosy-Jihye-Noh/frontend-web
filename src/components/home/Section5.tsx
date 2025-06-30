import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Section5 = () => {
  const navigate = useNavigate();

  return (
    <section className="text-center py-20 px-4 bg-white dark:bg-gray-900">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        지금 바로 시작해보세요
      </h2>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        AI와 함께하는 스마트한 건강 관리, 더 이상 미루지 마세요.
      </p>
      <div className="mt-8">
        <Button
          onClick={() => navigate("dashboard")}
          className="bg-blue-600 text-white px-6 py-3 text-base md:px-8 md:py-4 md:text-lg font-medium transition-transform duration-200 hover:scale-105 hover:bg-blue-700"
        >
          무료로 시작하기
        </Button>
      </div>
    </section>
  );
};

export default Section5;
