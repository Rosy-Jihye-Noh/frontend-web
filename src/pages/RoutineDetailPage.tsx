import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Routine } from '@/types/index';
import { fetchRoutineById } from '@/services/api/routineApi';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';

const RoutineDetailPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routineId) {
      setError('루틴 ID가 유효하지 않습니다.');
      setIsLoading(false);
      return;
    }

    fetchRoutineById(Number(routineId))
      .then(data => {
        setRoutine(data);
      })
      .catch(err => {
        setError('루틴 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [routineId]);

  if (isLoading) return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  if (error) return <div className="flex justify-center items-center h-screen">에러: {error}</div>;
  if (!routine) return <div className="flex justify-center items-center h-screen">루틴 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main
        className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
        style={{ paddingTop: 'var(--header-height, 90px)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> 뒤로가기
            </Button>
            <Button variant="outline" onClick={() => navigate('/mypage')}>
              목록으로
            </Button>
          </div>
          <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate(`/routines/edit/${routine.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> 루틴 편집하기
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{routine.name}</CardTitle>
            <CardDescription className="text-base pt-2">{routine.description || '설명 없음'}</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-bold mt-4 mb-4 border-t pt-6">운동 목록</h3>
            <div className="space-y-3">
              {routine.exercises?.sort((a,b) => a.order - b.order).map((ex, index) => (
                <Link 
                  to={`/exercises/${ex.exerciseId}`} 
                  key={ex.exerciseId} 
                  className="block p-4 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400 mr-4">{index + 1}</span>
                    <div className="flex-grow">
                      <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{ex.exerciseName}</p>
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