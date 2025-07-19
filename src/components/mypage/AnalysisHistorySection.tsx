import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import type { AnalysisHistoryItem } from '@/types/index';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AnalysisHistorySectionProps {
    history: AnalysisHistoryItem[];
}

const AnalysisHistorySection: React.FC<AnalysisHistorySectionProps> = ({ history }) => {
  const navigate = useNavigate();

  // 점수들의 평균을 계산하고 날짜와 함께 매핑하는 함수
  const chartData = history.map(item => {
    const scores = [item.spineCurvScore, item.spineScolScore, item.pelvicScore, item.neckScore, item.shoulderScore];
    const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    return {
      date: new Date(item.createdAt).toLocaleDateString(),
      averageScore: average
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // 날짜순으로 정렬

  return (
    <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">사진 분석 기록</h2>
        
        {/* Recharts를 사용한 그래프 */}
        <div className="h-60 bg-gradient-to-r from-gray-100 to-blue-100 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  backdropFilter: 'blur(5px)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend wrapperStyle={{fontSize: "14px"}}/>
              <Line 
                type="monotone" 
                dataKey="averageScore" 
                name="평균 점수"
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-1 mt-4">
            {history.map((item) => {
                const averageScore = Math.round(
                    [item.spineCurvScore, item.spineScolScore, item.pelvicScore, item.neckScore, item.shoulderScore]
                    .reduce((sum, score) => sum + score, 0) / 5
                );
                return (
                    <li key={item.id} className="flex justify-between items-center text-sm p-3 hover:bg-muted rounded-md">
                        <span className="text-gray-600 dark:text-gray-300">{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-100">{averageScore}점</span>
                        <button 
                          onClick={() => navigate(`/analysis-result/${item.id}`)}
                          className="text-blue-600 dark:text-blue-400 font-semibold text-xs hover:underline"
                        >
                          보기
                        </button>
                    </li>
                );
            })}
        </ul>
    </Card>
  );
};

export default AnalysisHistorySection;