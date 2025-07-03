import React from 'react';
import type { Exercise } from '@/types/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface SelectedExercisesListProps {
  exercises: Exercise[];
  onRemoveExercise: (exerciseId: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

const SelectedExercisesList: React.FC<SelectedExercisesListProps> = ({
  exercises, onRemoveExercise, onMoveUp, onMoveDown
}) => (
  <Card>
    <CardHeader>
      <CardTitle>루틴에 포함된 운동 ({exercises.length}개)</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {exercises.length > 0 ? (
          exercises.map((ex, index) => (
            <div
              key={ex.id}
              // 순서 변경 애니메이션
              className="flex items-center bg-white p-3 rounded-lg border shadow-sm transition-transform duration-300 ease-in-out"
            >
              {/* 현재 순서 표시 */}
              <span className="flex-shrink-0 w-8 text-center font-bold text-lg text-gray-500">
                {index + 1}
              </span>
              <div className="flex-grow">
                <p className="font-semibold">{ex.name}</p>
                <p className="text-sm text-gray-500">{ex.bodyPart}</p>
              </div>
              <div className="flex items-center">
                {/* 위/아래 화살표 버튼 추가 */}
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0} // 첫 번째 항목일 때 비활성화
                  className="hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onMoveDown(index)}
                  disabled={index === exercises.length - 1} // 마지막 항목일 때 비활성화
                  className="hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onRemoveExercise(ex.id)} className="hover:bg-red-50">
                  <XCircle className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">
            운동을 추가해주세요.
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default SelectedExercisesList;