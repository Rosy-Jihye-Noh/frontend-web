import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Routine } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, Eye } from 'lucide-react';

interface MyRoutineSectionProps {
  routines: Routine[];
  onDeleteRoutine: (routineId: number) => void; // 삭제 핸들러 prop 추가
}

const MyRoutineSection: React.FC<MyRoutineSectionProps> = ({ routines, onDeleteRoutine }) => {
  const navigate = useNavigate();

  const handleDeleteClick = (e: React.MouseEvent, routineId: number) => {
    e.stopPropagation();
    if (window.confirm('정말로 이 루틴을 삭제하시겠습니까?')) {
      onDeleteRoutine(routineId); // 부모 컴포넌트의 삭제 함수 호출
    }
  };
  const handleEditClick = (e: React.MouseEvent, routineId: number) => {
    e.stopPropagation();
    navigate(`/routines/edit/${routineId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">내 루틴 관리</h2>
        <Button
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => navigate('/routines/new')}
        >
        <PlusCircle className="mr-2 h-4 w-4" /> 새 루틴 추가하기
        </Button>
      </div>

      {routines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map(routine => (
            <Card 
              key={routine.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/routines/${routine.id}`)}
            >
              <CardHeader>
                <CardTitle className="truncate">{routine.name}</CardTitle>
                <CardDescription className="truncate">{routine.description || '설명 없음'}</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-2 text-sm">포함된 운동:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {routine.exercises && routine.exercises.slice(0, 3).map(ex => (
                    <li key={ex.exerciseId} className="truncate">- {ex.exerciseName}</li>
                  ))}
                  {routine.exercises && routine.exercises.length > 3 && (
                    <li className="text-gray-500 dark:text-gray-400">... 외 {routine.exercises.length - 3}개</li>
                  )}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={(e) => handleEditClick(e, routine.id)}>
                  <Edit className="mr-1 h-4 w-4 text-green-500" /> 편집
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => handleDeleteClick(e, routine.id)}>
                  <Trash2 className="mr-1 h-4 w-4 text-red-500" /> 삭제
              </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p>생성된 루틴이 없습니다.</p>
          <Button 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={() => navigate('/routines/new')}
          >
            첫 루틴 만들러 가기
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyRoutineSection;