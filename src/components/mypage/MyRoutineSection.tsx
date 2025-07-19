import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Routine } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

interface MyRoutineSectionProps {
  routines: Routine[];
  onDeleteRoutine: (routineId: number) => void;
}

const MyRoutineSection: React.FC<MyRoutineSectionProps> = ({ routines, onDeleteRoutine }) => {
  const navigate = useNavigate();

  const handleDeleteClick = (e: React.MouseEvent, routineId: number) => {
    e.stopPropagation();
    if (window.confirm('정말로 이 루틴을 삭제하시겠습니까?')) {
      onDeleteRoutine(routineId);
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
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
          onClick={() => navigate('/routines/new')}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> 새 루틴 추가하기
        </Button>
      </div>

      {routines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routines.map(routine => (
            <Card 
              key={routine.id} 
              className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              onClick={() => navigate(`/routines/${routine.id}`)}
            >
              <CardHeader className="p-5">
                <CardTitle className="truncate font-bold text-lg">{routine.name}</CardTitle>
                <CardDescription className="truncate pt-1">{routine.description || '설명 없음'}</CardDescription>
              </CardHeader>
              <CardContent className="p-5 flex-grow">
                <h4 className="font-semibold mb-2 text-sm text-neutral-600 dark:text-neutral-300">포함된 운동:</h4>
                <ul className="space-y-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  {routine.exercises && routine.exercises.slice(0, 3).map(ex => (
                    <li key={ex.exerciseId} className="truncate">- {ex.exerciseName}</li>
                  ))}
                  {routine.exercises && routine.exercises.length > 3 && (
                    <li className="text-neutral-400 dark:text-neutral-500">... 외 {routine.exercises.length - 3}개</li>
                  )}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 p-4 bg-muted/50 rounded-b-2xl">
                <Button variant="ghost" size="sm" onClick={(e) => handleEditClick(e, routine.id)} className="flex items-center gap-1.5 text-neutral-600 hover:text-green-600">
                  <Edit className="h-4 w-4" /> 편집
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => handleDeleteClick(e, routine.id)} className="flex items-center gap-1.5 text-neutral-600 hover:text-red-600">
                  <Trash2 className="h-4 w-4" /> 삭제
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/30">
          <p className="text-neutral-500">생성된 루틴이 없습니다.</p>
          <Button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105" 
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