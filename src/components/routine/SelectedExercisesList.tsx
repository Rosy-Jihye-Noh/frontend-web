import React from 'react';
import type { Exercise } from '@/types/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

// onDragEnd prop 제거
interface SelectedExercisesListProps {
  exercises: Exercise[];
  onRemoveExercise: (exerciseId: number) => void;
}

const SelectedExercisesList: React.FC<SelectedExercisesListProps> = ({
  exercises, onRemoveExercise
}) => (
  <Card>
    <CardHeader>
      <CardTitle>루틴에 포함된 운동 ({exercises.length}개)</CardTitle>
    </CardHeader>
    <CardContent>
      {/* DragDropContext와 관련된 모든 코드를 제거하고 단순한 div와 map으로 변경 */}
      <div className="min-h-[200px] space-y-2">
        {exercises.length > 0 ? (
          exercises.map((ex) => (
            // Draggable 대신 일반 div 사용
            <div
              key={ex.id}
              className="flex items-center bg-white p-3 rounded-lg border shadow-sm"
            >
              {/* 드래그 핸들 아이콘 제거 */}
              <div className="flex-grow">
                <p className="font-semibold">{ex.name}</p>
                <p className="text-sm text-gray-500">{ex.bodyPart}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => onRemoveExercise(ex.id)}>
                <XCircle className="h-5 w-5 text-red-500" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">
            왼쪽에서 운동을 추가해주세요.
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default SelectedExercisesList;