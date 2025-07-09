import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Routine } from '@/types/index';
import { fetchRoutineById } from '@/services/api/routineApi'; // 루틴 ID로 루틴 정보를 가져오는 API 함수 임포트
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';

// RoutineDetailPage 함수형 컴포넌트
const RoutineDetailPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수
  
  // 컴포넌트 상태 변수들
  const [routine, setRoutine] = useState<Routine | null>(null); // 현재 표시할 루틴 상세 정보
  const [isLoading, setIsLoading] = useState(true); // 데이터 로딩 중인지 여부
  const [error, setError] = useState<string | null>(null); // 오류 메시지

  // 컴포넌트 마운트 시 또는 `routineId`가 변경될 때 루틴 데이터를 불러오는 useEffect 훅
  useEffect(() => {
    // routineId가 유효하지 않으면 에러 설정 후 로딩 종료
    if (!routineId) {
      setError('루틴 ID가 유효하지 않습니다.');
      setIsLoading(false);
      return;
    }

    // `fetchRoutineById` API를 호출하여 루틴 정보를 비동기적으로 가져옵니다.
    fetchRoutineById(Number(routineId)) // URL 파라미터는 문자열이므로 숫자로 변환
      .then(data => {
        setRoutine(data); // 성공적으로 데이터를 받아오면 routine 상태 업데이트
      })
      .catch(err => {
        // 오류 발생 시 에러 메시지 설정
        setError('루틴 정보를 불러오는 데 실패했습니다.');
        console.error(err); // 콘솔에 실제 에러 로깅
      })
      .finally(() => {
        setIsLoading(false); // 로딩 상태 종료 (성공 또는 실패와 무관하게)
      });
  }, [routineId]); // `routineId`가 변경될 때마다 이펙트를 다시 실행

  // 로딩 중일 때 표시할 UI
  if (isLoading) return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  // 에러가 발생했을 때 표시할 UI
  if (error) return <div className="flex justify-center items-center h-screen">에러: {error}</div>;
  // 루틴 정보를 찾을 수 없을 때 (로딩은 끝났지만 `routine`이 null인 경우) 표시할 UI
  if (!routine) return <div className="flex justify-center items-center h-screen">루틴 정보를 찾을 수 없습니다.</div>;

  // 모든 데이터 로딩이 완료되고 루틴 정보가 유효할 때 상세 페이지 UI 렌더링
  return (
    <div className="bg-background min-h-screen"> {/* 전체 배경색 및 최소 화면 높이 설정 */}
      <Header /> {/* 상단 헤더 컴포넌트 */}
      <main
        className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8" // 메인 콘텐츠 영역 (최대 너비, 중앙 정렬, 반응형 패딩)
        style={{ paddingTop: 'var(--header-height, 90px)' }} // 헤더 높이만큼 상단 패딩 추가
      >
        {/* 상단 버튼 섹션 (뒤로가기, 루틴 편집하기) */}
        <div className="flex justify-between items-center mb-6">
          {/* '뒤로가기' 버튼 */}
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> 뒤로가기
          </Button>
          {/* '루틴 편집하기' 버튼 */}
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" // 버튼 스타일
            onClick={() => navigate(`/routines/edit/${routine.id}`)} // 클릭 시 루틴 편집 페이지로 이동
          >
            <Edit className="mr-2 h-4 w-4" /> 루틴 편집하기
          </Button>
        </div>

        {/* 루틴 상세 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{routine.name} 📋</CardTitle> {/* 루틴 이름 */}
            <CardDescription className="text-base pt-2">{routine.description || '설명 없음'}</CardDescription> {/* 루틴 설명, 없으면 '설명 없음' 표시 */}
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-bold mt-4 mb-4 border-t pt-6">운동 목록 💪</h3> {/* 운동 목록 섹션 제목 */}
            <div className="space-y-3"> {/* 운동 항목들 간의 세로 간격 */}
              {/* 루틴에 포함된 운동들을 순서대로 매핑하여 표시 */}
              {routine.exercises?.sort((a,b) => a.order - b.order).map((ex, index) => (
                <Link // 각 운동을 클릭 시 해당 운동 상세 페이지로 이동하는 링크
                  to={`/exercises/${ex.exerciseId}`} // 운동 상세 페이지 경로
                  key={ex.exerciseId} // React 리스트 렌더링을 위한 고유 키
                  className="block p-4 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700" // 링크 스타일
                >
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400 mr-4">{index + 1}</span> {/* 운동 순서 번호 */}
                    <div className="flex-grow">
                      <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{ex.exerciseName}</p> {/* 운동 이름 */}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RoutineDetailPage;