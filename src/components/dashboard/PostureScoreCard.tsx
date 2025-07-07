import React from 'react';
import { HiChartBar } from 'react-icons/hi';

const PostureScoreCard: React.FC = () => (
  <div className="flex flex-col items-center p-6 shadow-lg rounded-lg">
    <HiChartBar className="text-blue-500 w-10 h-10 mb-2" />
    <h2 className="text-xl font-bold mb-4 text-center">자세 점수 변화</h2>
            <div className="h-60 w-full flex items-center justify-center bg-muted rounded-lg text-muted-foreground">그래프 영역</div>
  </div>
);

export default PostureScoreCard; 