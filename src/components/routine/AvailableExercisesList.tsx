import React from 'react';
import type { Exercise } from '@/types/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface AvailableExercisesListProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  exercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
}

const AvailableExercisesList: React.FC<AvailableExercisesListProps> = ({
  searchTerm, onSearchTermChange, exercises, onAddExercise
}) => (
  <Card>
    <CardHeader>
      <CardTitle>운동 추가하기</CardTitle>
    </CardHeader>
    <CardContent>
      <Input
        placeholder="추가할 운동 이름 검색"
        value={searchTerm}
        onChange={e => onSearchTermChange(e.target.value)}
        className="mb-4"
      />
      <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
        {exercises.map(ex => (
          <div key={ex.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100">
            <div>
              <p className="font-semibold">{ex.name}</p>
              <p className="text-sm text-gray-500">{ex.bodyPart}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => onAddExercise(ex)}>
              <PlusCircle className="h-5 w-5 text-blue-500" />
            </Button>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default AvailableExercisesList;