import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HiArrowRight } from "react-icons/hi";

const Section1 = () => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center justify-center min-h-screen 
                      bg-gray-50 dark:bg-gray-900 px-4 py-16 md:py-24 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
        <span className="text-blue-500">AI</span>와 함께 똑똑하게, <br />
        나를 위한{" "}
        <span className="underline decoration-blue-500 decoration-4">
          진짜 운동
        </span>
        을 시작하세요
      </h1>
      <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
        당신의 몸을 가장 잘 아는 파트너, Health AI가 24시간 함께합니다.
      </p>
      <Button
        onClick={() => navigate("/")}
        style={{ padding: "1.25rem 2rem", fontSize: "1.125rem" }}
        className="bg-blue-600 text-white flex items-center  justify-center gap-2 mt-8 
                    px-6 py-4 text-lg md:px-8 md:py-5
                    transition-transform duration-200 hover:scale-105 hover:bg-blue-700"
      >
        내 몸 상태 분석하기 <HiArrowRight className="w-5 h-5" />
      </Button>


    </section>
  );
};

export default Section1;
