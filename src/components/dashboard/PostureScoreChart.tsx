import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useUserStore } from '@/store/userStore';
import { fetchUserAnalysisHistory } from '@/services/api/myPageApi';
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
                const sortedData = historyData
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 7)
                    .reverse();
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
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full" />
                    <p className="mt-3 text-sm">점수 로딩 중...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-destructive">
                    <HiChartPie className="w-12 h-12 mb-2" />
                    <p className="font-semibold">{error}</p>
                    <p className="text-sm">나중에 다시 시도해주세요.</p>
                </div>
            );
        }

        if (history.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <HiChartPie className="w-12 h-12 mb-3" />
                    <p className="font-semibold text-foreground">분석 기록이 없습니다</p>
                    <p className="text-sm">자세를 분석하고 점수 변화를 확인해보세요!</p>
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="date" stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "10px" }} />
                    <Line type="monotone" dataKey="평균 점수" stroke="#007AFF" strokeWidth={3} activeDot={{ r: 8, style: { fill: '#007AFF' } }} dot={{ r: 4, style: { fill: '#007AFF' } }} />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    return (
        <Card
            className="p-6 shadow-md rounded-2xl h-full flex flex-col cursor-pointer transition-all hover:shadow-lg active:scale-[0.98]"
            onClick={() => navigate('/mypage')}
        >
            <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-bold text-foreground">자세 점수 변화 📈</CardTitle>
                <CardDescription>최근 7번의 분석에 대한 평균 점수입니다.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-grow h-48">
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default PostureScoreChart;