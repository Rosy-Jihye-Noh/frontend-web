import React from 'react';
import { Button } from '@/components/ui/button';
import { HiStar, HiCamera, HiLightningBolt } from 'react-icons/hi';

interface MainFeaturesCardProps {
  onPostureAnalysis: () => void;
  onWorkoutRecommend: () => void;
}

const MainFeaturesCard: React.FC<MainFeaturesCardProps> = ({ onPostureAnalysis, onWorkoutRecommend }) => (
  <div className="md:col-span-2 flex flex-col justify-between items-center p-6 shadow-lg rounded-lg">
    <HiStar className="text-yellow-400 w-10 h-10 mb-2" />
    <h2 className="text-xl font-bold mb-4 text-center">주요 기능</h2>
    <div className="grid grid-cols-2 gap-6 w-full">
              <Button onClick={onPostureAnalysis} className="flex flex-col items-center p-6 min-h-[120px] bg-muted rounded-lg hover:bg-muted/80 transition shadow cursor-pointer">
        <HiCamera className="w-12 h-12 text-blue-500 mb-2" />
        <span className="mt-2 font-semibold text-gray-800 dark:text-gray-200">자세 분석</span>
      </Button>
              <Button onClick={onWorkoutRecommend} className="flex flex-col items-center p-6 min-h-[120px] bg-muted rounded-lg hover:bg-muted/80 transition shadow cursor-pointer">
        <HiLightningBolt className="w-12 h-12 text-yellow-400 mb-2" />
        <span className="mt-2 font-semibold text-gray-800 dark:text-gray-200">운동 추천</span>
      </Button>
    </div>
  </div>
);

export default MainFeaturesCard; 