import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Section3 = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    {
      src: "https://res.cloudinary.com/die6y2sez/image/upload/v1753495808/1_ahqjvp.png",
      alt: "AI 자세 분석 예시"
    },
    {
      src: "https://res.cloudinary.com/die6y2sez/image/upload/v1753495808/2_vfbxnk.png",
      alt: "AI 코치 대화 예시"
    },
    {
      src: "https://res.cloudinary.com/die6y2sez/image/upload/v1753495807/4_qgausp.png",
      alt: "감정 분석 예시"
    },
    {
      src: "https://res.cloudinary.com/die6y2sez/image/upload/v1753495807/3_ff39ku.png",
      alt: "운동 기록 예시"
    },
    {
      src: "https://res.cloudinary.com/die6y2sez/image/upload/v1753498270/6_wugovm.png",
      alt: "목표 추천 예시"
    },
    {
      src: "https://res.cloudinary.com/die6y2sez/image/upload/v1753498269/7_qvwt6e.png",
      alt: "운동 목록 운동 추천 예시"
    }
  ];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // 현재 표시할 이미지들을 계산
  const getVisibleImages = () => {
    const visibleImages = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % images.length;
      visibleImages.push(images[index]);
    }
    return visibleImages;
  };

  return (
    <section ref={ref} className="py-16 px-4 bg-gray-100 dark:bg-background">
      <div className={`container mx-auto transition-all duration-1000 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-10 opacity-0'
      }`}>
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-foreground">
          Health AI는 이렇게 동작해요
        </h3>
        
        {/* Carousel Container */}
        <div className="relative max-w-9xl mx-auto">
          {/* Main Images Grid */}
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
              {getVisibleImages().map((image, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg shadow-xl transition-all duration-500 ease-in-out"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full rounded-lg shadow-xl"
                  />
                </div>
              ))}
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 z-10"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 z-10"
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Image Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`${index + 1}번째 이미지로 이동`}
              />
            ))}
          </div>

          {/* Image Description */}
          <div className="text-center mt-4">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section3;
