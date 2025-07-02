import React from 'react';
import { Card } from '../ui/card';
import { HiTrendingUp } from "react-icons/hi";

// history 객체에 id가 포함되도록 타입 수정
interface AnalysisHistoryItem {
    id: string | number; // ✨ 1. id 타입을 추가합니다. (백엔드 데이터에 맞춰 string 또는 number)
    date: string;
    score: number;
}

interface AnalysisHistorySectionProps {
    history: AnalysisHistoryItem[];
}

const AnalysisHistorySection: React.FC<AnalysisHistorySectionProps> = ({ history }) => (
    <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">사진 분석 기록</h2>
        <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <HiTrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-500 dark:text-gray-400 ml-4">자세 점수 변화 그래프</p>
        </div>
        <ul className="space-y-2">
            {history.map((item) => (
                // ✨ 2. 각 list item에 고유한 id를 key로 지정합니다.
                <li key={item.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <span className="text-gray-600 dark:text-gray-300">{item.date}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{item.score}점</span>
                    <button className="text-blue-600 dark:text-blue-400 font-semibold text-xs hover:underline">결과 보기</button>
                </li>
            ))}
        </ul>
    </Card>
);

export default AnalysisHistorySection;