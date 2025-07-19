import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useUserStore } from '@/store/userStore';
import { fetchUserAnalysisHistory } from '@/services/api/myPageApi'; // myPageApi에 정의된 함수 사용
import type { AnalysisHistoryItem } from '@/types/index';
import { HiChartPie } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const PostureScoreChart: React.FC = () => {
    const { user } = useUserStore();
    const navigate = useNavigate();
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const historyData = await fetchUserAnalysisHistory(user.id);
                // 최신 7개의 기록만 사용하도록 슬라이스하고, 날짜순으로 정렬
                const sortedData = historyData
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 7)
                    .reverse(); // 차트에는 오래된 날짜부터 보이도록 다시 뒤집기
                setHistory(sortedData);
            } catch (err) {
                setError('데이터를 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const chartData = history.map(item => {
        const scores = [item.spineCurvScore, item.spineScolScore, item.pelvicScore, item.neckScore, item.shoulderScore];
        const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        return {
            date: new Date(item.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
            "평균 점수": average
        };
    });

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    <p className="mt-2 text-sm text-gray-500">점수 불러오는 중...</p>
                </div>
            );
        }

        if (error) {
            return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
        }

        if (history.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <HiChartPie className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 font-semibold">분석 기록이 없어요</p>
                    <p className="text-sm text-gray-400 mt-1">자세 분석 후 점수 변화를 확인해보세요!</p>
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "10px" }} />
                    <Line type="monotone" dataKey="평균 점수" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    return (
        <Card className="p-4 shadow-lg h-full flex flex-col cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate('/mypage')}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">자세 점수 변화 📈</h3>
            <div className="flex-grow h-48">
                {renderContent()}
            </div>
        </Card>
    );
};

export default PostureScoreChart;