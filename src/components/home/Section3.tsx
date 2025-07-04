import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Section3 = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-16 px-4 bg-gray-100">
      <div className={`container mx-auto transition-all duration-1000 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-10 opacity-0'
      }`}>
        <h3 className="text-3xl font-bold text-center mb-12">
          Health AI는 이렇게 동작해요
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            alt="AI 자세 분석 예시"
            className="rounded-lg shadow-xl"
          />
          <img
            src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80"
            alt="AI 코치 대화 예시"
            className="rounded-lg shadow-xl"
          />
          <img
            src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80"
            alt="운동 추천 예시"
            className="rounded-lg shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Section3;
