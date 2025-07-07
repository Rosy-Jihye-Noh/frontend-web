import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { HiTrendingUp } from "react-icons/hi";
import type { AnalysisHistoryItem } from '@/types/index';

interface AnalysisHistorySectionProps {
    history: AnalysisHistoryItem[];
}

const AnalysisHistorySection: React.FC<AnalysisHistorySectionProps> = ({ history }) => {
  const navigate = useNavigate();

  // 점수들의 평균을 계산하는 함수
  const calculateAverageScore = (item: AnalysisHistoryItem) => {
    const scores = [item.spineCurvScore, item.spineScolScore, item.pelvicScore, item.neckScore, item.shoulderScore];
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average);
  };

  return (
    <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">사진 분석 기록</h2>
        <div className="h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
            <HiTrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-500 dark:text-gray-400 ml-4">자세 점수 변화 그래프</p>
        </div>
        <ul className="space-y-1">
            {history.map((item) => (
                <li key={item.id} className="flex justify-between items-center text-sm p-3 hover:bg-muted rounded-md">
                    {/* toLocaleDateString()을 사용해 날짜만 표시 */}
                    <span className="text-gray-600 dark:text-gray-300">{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{calculateAverageScore(item)}점</span>
                    {/* ✨ 클릭 시 상세 페이지로 이동 */}
                    <button 
                      onClick={() => navigate(`/analysis-result/${item.id}`)}
                      className="text-blue-600 dark:text-blue-400 font-semibold text-xs hover:underline"
                    >
                      보기
                    </button>
                </li>
            ))}
        </ul>
    </Card>
  );
};

export default AnalysisHistorySection;