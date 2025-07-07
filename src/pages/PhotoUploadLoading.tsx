import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/common/Header';
import { HiCheckCircle } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';

interface LocationState {
  frontPhoto: File;
  sidePhoto: File;
}

const PhotoUploadLoading: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'result'>('idle');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();
  const { frontPhoto, sidePhoto } = (location.state as LocationState) || {};

  useEffect(() => {
    // 페이지 진입 시 자동으로 분석 시작
    if (frontPhoto && sidePhoto && user) {
      handleStartAnalysis();
    } else if (!user) {
      navigate('/login');
    }
  }, [frontPhoto, sidePhoto, user, navigate]);

  const handleStartAnalysis = async () => {
    if (!frontPhoto || !sidePhoto || !user) return;

    setStatus('loading');
    
    try {
      // AI 분석 시뮬레이션 (3초 대기)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 분석 완료 후 결과 페이지로 이동
      // 임시로 고정된 ID 사용 (실제로는 서버에서 생성된 ID를 사용)
      const mockHistoryId = Date.now(); // 실제로는 서버 응답에서 받은 ID
      setStatus('result');
      
      // 2초 후 결과 페이지로 이동
      setTimeout(() => {
        navigate(`/analysis-result/${mockHistoryId}`);
      }, 2000);

    } catch (error) {
      console.error('분석 중 오류 발생:', error);
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      navigate('/photoupload');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">AI가 분석 중입니다...</h2>
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">잠시만 기다려주세요.</p>
          </div>
        );

      case 'result':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 min-h-[60vh]">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">분석 완료!</h2>
            <div className="flex flex-col items-center justify-center">
              <HiCheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">결과 페이지로 이동합니다...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto pt-32 px-4 sm:px-8 lg:px-16 pb-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default PhotoUploadLoading; 