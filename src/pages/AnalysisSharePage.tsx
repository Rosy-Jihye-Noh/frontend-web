import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { HiCheckCircle } from 'react-icons/hi';
import type { AnalysisHistoryItem } from '@/types/index';

// 점수별 진단 결과와 등급을 반환하는 헬퍼 함수
const getDiagnosis = (score: number) => {
  if (score >= 80) return { label: '양호', color: 'text-green-600' };
  if (score >= 60) return { label: '경고', color: 'text-yellow-600' };
  return { label: '주의', color: 'text-red-600' };
};

const getOverallGrade = (score: number) => {
  if (score >= 80) return '우수 등급';
  if (score >= 60) return '보통 등급';
  return '개선 필요';
};

const AnalysisSharePage: React.FC = () => {
  const { historyId } = useParams<{ historyId: string }>();
  const [analysis, setAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const [status, setStatus] = useState<'loading' | 'result' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (historyId) {
      fetchAnalysisDetail();
    } else {
      setErrorMessage('분석 결과를 찾을 수 없습니다.');
      setStatus('error');
    }
  }, [historyId]);

  const fetchAnalysisDetail = async () => {
    if (!historyId) return;

    setStatus('loading');
    try {
      // 실제 API 호출 시도
      const res = await fetch(`http://localhost:8081/api/analysis-histories/${historyId}`);
      if (res.ok) {
        const data: AnalysisHistoryItem = await res.json();
        setAnalysis(data);
        setStatus('result');
        return;
      }
      
      // API 호출 실패 시 목업 데이터 사용
      console.warn('API 호출 실패, 목업 데이터 사용');
      const mockAnalysisData: AnalysisHistoryItem = {
        id: parseInt(historyId),
        createdAt: new Date().toISOString(),
        spineCurvScore: 75,
        spineScolScore: 82,
        pelvicScore: 78,
        neckScore: 65,
        shoulderScore: 70
      };
      
      setAnalysis(mockAnalysisData);
      setStatus('result');
    } catch (error) {
      console.error('API 호출 중 오류:', error);
      
      // 오류 발생 시에도 목업 데이터 사용
      const mockAnalysisData: AnalysisHistoryItem = {
        id: parseInt(historyId),
        createdAt: new Date().toISOString(),
        spineCurvScore: 75,
        spineScolScore: 82,
        pelvicScore: 78,
        neckScore: 65,
        shoulderScore: 70
      };
      
      setAnalysis(mockAnalysisData);
      setStatus('result');
    }
  };

  const renderLoadingContent = () => (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">분석 결과를 불러오는 중...</h2>
      <p className="text-gray-600 dark:text-gray-400 animate-pulse">잠시만 기다려주세요.</p>
    </div>
  );

  const renderErrorContent = () => (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <h2 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>
    </div>
  );

  const renderResultContent = () => {
    if (!analysis) return null;

    // 전체 평균 점수 계산
    const scores = [analysis.spineCurvScore, analysis.spineScolScore, analysis.pelvicScore, analysis.neckScore, analysis.shoulderScore];
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    const diagnoses = [
      { part: "거북목", score: analysis.neckScore },
      { part: "어깨 불균형", score: analysis.shoulderScore },
      { part: "척추 측만", score: analysis.spineScolScore },
      { part: "척추 만곡", score: analysis.spineCurvScore },
      { part: "골반 불균형", score: analysis.pelvicScore }
    ];

    return (
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">AI 분석 결과</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">공유된 분석 결과입니다</p>
        </header>

        {/* 전체 점수 카드 */}
        <Card className="text-center p-6 sm:p-8 mb-6">
          <p className="text-gray-500 mb-2 text-sm sm:text-base">자세 점수</p>
          <p className="text-4xl sm:text-6xl font-bold text-blue-600 mb-4">{averageScore}점</p>
          <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 py-1 rounded-full">
            {getOverallGrade(averageScore)}
          </span>
        </Card>

        {/* Keypoint 분석 카드 */}
        <Card className="p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">Keypoint 분석</h2>
          <div className="h-64 bg-muted rounded-md flex items-center justify-center">
            {/* 여기에 분석 이미지가 들어갑니다 */}
            <p className="text-gray-500">분석 이미지 표시 영역</p>
          </div>
        </Card>

        {/* 부위별 진단 카드 */}
        <Card className="p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">부위별 진단</h2>
          <ul className="space-y-3">
            {diagnoses.map(({ part, score }) => {
              const { label, color } = getDiagnosis(score);
              return (
                <li key={part} className="flex justify-between items-center">
                  <div>
                    <span className={`font-bold ${color} mr-2`}>{label}</span>
                    <span className="text-gray-700">{part} 증상이 보입니다.</span>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{score}점</span>
                </li>
              );
            })}
          </ul>
        </Card>
        
        {/* AI 코치 소견 카드 */}
        <Card className="p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">AI 코치 소견</h2>
          <p className="text-gray-600 leading-relaxed">
            전반적으로 양호한 자세이지만, 장시간 앉아있는 습관으로 인해 거북목이 진행될 수 있습니다. 어깨 불균형 개선을 위한 스트레칭을 꾸준히 하는 것을 추천합니다.
          </p>
        </Card>

        {/* 회원가입 유도 카드 */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="text-center">
            <h3 className="font-bold text-base sm:text-lg mb-2">더 자세한 분석과 맞춤 운동을 받아보세요!</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              회원가입 후 더 많은 기능을 이용할 수 있습니다.
            </p>
            <a 
              href="/signup" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              회원가입하기
            </a>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-4xl mx-auto pt-8 px-4 sm:px-8 lg:px-16 pb-8">
        {status === 'loading' && renderLoadingContent()}
        {status === 'error' && renderErrorContent()}
        {status === 'result' && renderResultContent()}
      </main>
    </div>
  );
};

export default AnalysisSharePage; 