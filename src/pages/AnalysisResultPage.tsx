import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import Header from '@/components/common/Header';
import { useUserStore } from '@/store/userStore';
import type { AnalysisHistoryItem } from '@/types/index';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface LocationState {
  frontPhoto: File;
  sidePhoto: File | null;
}

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

const AnalysisResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { historyId } = useParams<{ historyId: string }>();
  const { user } = useUserStore();
  const analysisFromState = (location.state as any)?.analysis as AnalysisHistoryItem | undefined;
  const [analysis, setAnalysis] = useState<AnalysisHistoryItem | null>(analysisFromState || null);
  const [status, setStatus] = useState<'loading' | 'completed' | 'result' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 사진 데이터 확인
  const { frontPhoto, sidePhoto } = (location.state as LocationState) || {};

  useEffect(() => {
    if (analysisFromState) {
      setStatus('loading');
      setTimeout(() => {
        setStatus('completed');
        setTimeout(() => {
          setAnalysis(analysisFromState);
          setStatus('result');
        }, 2000);
      }, 2000);
      return;
    }
    // 사진 데이터가 있으면 분석 시작, 없으면 historyId로 기존 결과 조회
    if (frontPhoto && user) {
      handleStartAnalysis();
    } else if (historyId) {
      fetchAnalysisDetail();
    } else {
      setErrorMessage('분석할 사진이 없습니다.');
      setStatus('error');
    }
  }, [frontPhoto, sidePhoto, user, historyId, analysisFromState]);

  const handleStartAnalysis = async () => {
    if (!frontPhoto || !user) return;

    setStatus('loading');
    
    try {
      // AI 분석 시뮬레이션 (3초 대기)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 분석 완료 상태로 변경
      setStatus('completed');
      
      // 2초 후 결과 표시
      setTimeout(() => {
        // 분석 완료 후 결과 데이터 설정
        const mockAnalysisData: AnalysisHistoryItem = {
          id: Date.now(),
          createdAt: new Date().toISOString(),
          spineCurvScore: 75,
          spineScolScore: 82,
          pelvicScore: 78,
          neckScore: 65,
          shoulderScore: 70
        };
        
        setAnalysis(mockAnalysisData);
        setStatus('result');
      }, 2000);

    } catch (error) {
      console.error('분석 중 오류 발생:', error);
      setErrorMessage('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      setStatus('error');
    }
  };

  const fetchAnalysisDetail = async () => {
    if (!historyId) return;

    setStatus('loading');
    try {
      const res = await fetch(`http://localhost:8081/api/analysis-histories/${historyId}`);
      if (!res.ok) throw new Error('분석 기록을 불러오는데 실패했습니다.');
      const data: AnalysisHistoryItem = await res.json();
      setAnalysis(data);
      setStatus('result');
    } catch (error) {
      console.error(error);
      setErrorMessage('데이터를 불러오는 중 오류가 발생했습니다.');
      setStatus('error');
    }
  };

  // 챗봇 오픈 트리거 (실제 구현은 전역 상태/컨텍스트 등에서 처리 필요)
  const openChatbot = (type: 'video' | 'consult') => {
    if (typeof window !== 'undefined' && typeof (window as any).openChatbot === 'function') {
      if (type === 'video') {
        (window as any).openChatbot('video', {
          videoUrl: 'https://www.youtube.com/watch?v=fFIL0rlRH78',
          thumbnail: 'https://img.youtube.com/vi/fFIL0rlRH78/0.jpg',
          message: '스크립트 요약과 댓글의 분석이 필요할 경우 챗으로 요청주세요.'
        });
      } else if (type === 'consult') {
        (window as any).openChatbot('consult', {
          message: '운동을 추천해드릴게요! 어떤 목표가 있으신가요?'
        });
      }
    } else {
      alert('챗봇 오픈! (실제 구현 필요)\n타입: ' + type);
    }
    setIsModalOpen(false);
  };

  const renderLoadingContent = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">AI가 분석 중입니다...</h2>
      <p className="text-gray-600 dark:text-gray-400 animate-pulse">잠시만 기다려주세요.</p>
    </div>
  );

  const renderCompletedContent = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 min-h-[60vh]">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">분석 완료!</h2>
      <div className="flex flex-col items-center justify-center">
        <HiCheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">결과를 확인해주세요.</p>
      </div>
    </div>
  );

  const renderErrorContent = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 min-h-[60vh]">
      <h2 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>
      <Button onClick={() => navigate('/photoupload')} className="bg-blue-600 hover:bg-blue-700">
        다시 시도하기
      </Button>
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
        <header className="relative flex items-center justify-center mb-6">
          <button onClick={() => navigate(-1)} className="absolute left-0 p-2">
            <HiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">AI 분석 결과</h1>
        </header>

        {/* 전체 점수 카드 */}
        <Card className="text-center p-8 mb-6">
          <p className="text-gray-500 mb-2">자세 점수</p>
          <p className="text-6xl font-bold text-blue-600 mb-4">{averageScore}점</p>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
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

        {/* 맞춤 운동 추천 버튼 */}
        <Button
          className="w-full !py-4 !text-base !font-bold bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          맞춤 운동 추천 보기
        </Button>
        {/* 모달 */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md w-full">
            <DialogTitle>원하는 추천 방식을 선택하세요</DialogTitle>
            <DialogDescription>
              원하는 방식을 선택하면 챗봇이 바로 도와드립니다.
            </DialogDescription>
            <div className="flex flex-col gap-6 items-center p-4">
              <Button
                className="w-full py-3 text-lg bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => openChatbot('video')}
              >
                추천 운동 영상 바로 시청
              </Button>
              <Button
                className="w-full py-3 text-lg bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => openChatbot('consult')}
              >
                AI 운동 코치와 맞춤 운동 상담하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto pt-32 px-4 sm:px-8 lg:px-16 pb-8">
        {status === 'loading' && renderLoadingContent()}
        {status === 'completed' && renderCompletedContent()}
        {status === 'error' && renderErrorContent()}
        {status === 'result' && renderResultContent()}
      </main>
    </div>
  );
};

export default AnalysisResultPage;