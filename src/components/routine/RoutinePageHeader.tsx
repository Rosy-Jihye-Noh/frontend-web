import React from 'react';
import { Button } from '@/components/ui/button';

interface RoutinePageHeaderProps {
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const RoutinePageHeader: React.FC<RoutinePageHeaderProps> = ({ isSaving, onSave, onCancel }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold">새로운 루틴 만들기</h1>
    <div className="flex gap-2">
      <Button variant="outline" onClick={onCancel}>취소</Button>
      <Button 
      className="bg-blue-600 hover:bg-blue-700 text-white"
      onClick={onSave} disabled={isSaving}>
        {isSaving ? '저장 중...' : '루틴 저장'}
      </Button>
    </div>
  </div>
);

export default RoutinePageHeader;