import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { HiCamera, HiVideoCamera, HiChatBubbleLeftRight } from "react-icons/hi2";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Section2 = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="w-full bg-white dark:bg-gray-900 px-4 py-16 md:py-24 text-center">

      <div className={`container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-10 opacity-0'
      }`}>
        {[
          { icon: <HiCamera className="w-8 h-8 text-blue-600" />, title: "사진 분석", desc: "단 한 장의 사진으로, AI가 내 몸의 불균형과 자세를 정밀하게 분석해줘요." },
          { icon: <HiVideoCamera className="w-8 h-8 text-blue-600" />, title: "맞춤 영상 추천", desc: "분석 결과에 따라, 나만을 위한 최적의 운동 영상을 추천받아요." },
          { icon: <HiChatBubbleLeftRight className="w-8 h-8 text-blue-600" />, title: "AI 트레이너", desc: "궁금한 점은 언제든지, 24시간 AI 코치가 실시간으로 답변해 드립니다." },
        ].map(({ icon, title, desc }) => (
          <Card key={title} className="p-6 text-center">
            <CardHeader className="items-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                {icon}
              </div>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

    </section>
  );
};

export default Section2;
