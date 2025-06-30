import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

const DUMMY_REVIEWS = [
  { id: 1, text: "Health AI 덕분에 운동 루틴 완전 바뀌었어요!", author: "Rosy" },
  { id: 2, text: "친절한 AI 코치가 24시간 내내 도움을 줘서 좋아요.", author: "Dorothy" },
  { id: 3, text: "운동 효과가 눈에 보여서 진짜 추천합니다!", author: "Inu" },
];

const Section4 = () => {
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % DUMMY_REVIEWS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-blue-50 dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-900">
          사용자들의 생생한 후기
        </h3>
        <div className="relative max-w-2xl mx-auto h-48 flex items-center justify-center">
          {DUMMY_REVIEWS.map((review, index) => (
            <div
              key={review.id}
              className={`absolute w-full transition-opacity duration-700 ease-in-out ${index === currentReview ? "opacity-100" : "opacity-0"
                }`}
            >
              <Card className="text-center shadow-lg p-8 bg-white dark:bg-gray-800">
                <p className="text-lg text-gray-700 dark:text-gray-300 italic">
                  &quot;{review.text}&quot;
                </p>
                <p className="mt-4 font-semibold text-gray-900 dark:text-white">
                  - {review.author}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section4;
