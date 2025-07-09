import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface RoutineInfoFormProps {
  routineName: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

const RoutineInfoForm: React.FC<RoutineInfoFormProps> = ({
  routineName, description, onNameChange, onDescriptionChange
}) => (
  <Card>
    {/* ... */}
    <CardContent className="space-y-4">
      <Input
        placeholder="루틴 이름 (예: 주 3일 전신 운동)"
        value={routineName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
        className="text-lg"
      />
      <Textarea
        placeholder="루틴에 대한 간단한 설명을 입력하세요."
        value={description}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onDescriptionChange(e.target.value)}
      />
    </CardContent>
  </Card>
);

export default RoutineInfoForm;