import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { HiUpload } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';

const PhotoUpload: React.FC = () => {
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const navigate = useNavigate();
  const { user } = useUserStore();

  useEffect(() => {
    // 로그인 상태 확인
    if (!user) {
      navigate('/login', { state: { from: '/photoupload' } });
    }
  }, [user, navigate]);

  const PhotoUploader = ({ photo, setPhoto, title, exampleUrl }: { photo: File | null, setPhoto: (f: File) => void, title: string, exampleUrl: string }) => (
    <div className="text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 h-full flex flex-col justify-center">
      {photo ? (
        <img src={URL.createObjectURL(photo)} alt={`${title} preview`} className="w-full h-48 object-contain rounded-lg mb-2" />
      ) : (
        <img src={exampleUrl} alt={`${title} example`} className="w-full h-48 object-contain rounded-lg mb-2 opacity-50" />
      )}
      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h4>
      <Button asChild variant="secondary" className="w-full cursor-pointer">
        <label>
          <HiUpload className="w-5 h-5 inline-block mr-1" /> {photo ? "사진 변경" : "사진 선택"}
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files && setPhoto(e.target.files[0])} />
        </label>
      </Button>
    </div>
  );

  // 로그인하지 않은 경우 로딩 화면 표시
  if (!user) {
    return (
      <div className="bg-slate-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto pt-32 px-4 sm:px-8 lg:px-16 pb-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">AI 자세 분석</h1>
        <Card className="p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">사진 업로드</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">정확한 분석을 위해 앉은 자세에서 앞모습과 옆모습 사진을 각각 업로드해주세요.</p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <PhotoUploader photo={frontPhoto} setPhoto={setFrontPhoto} title="앞모습 사진" exampleUrl="https://placehold.co/300x400/BFDBFE/1E40AF?text=Front+View" />
            <PhotoUploader photo={sidePhoto} setPhoto={setSidePhoto} title="옆모습 사진" exampleUrl="https://placehold.co/300x400/BFDBFE/1E40AF?text=Side+View" />
          </div>
          <Button
            onClick={() => { 
              if (frontPhoto && sidePhoto) {
                navigate('/photoanalysis-loading', { 
                  state: { frontPhoto, sidePhoto } 
                }); 
              }
            }}
            disabled={!frontPhoto || !sidePhoto}
            className="w-full text-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            분석 시작하기
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default PhotoUpload;
