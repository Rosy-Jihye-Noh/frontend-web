import React from 'react';
import type { Routine } from '@/types/index'; // 루틴 타입 임포트
import { Button } from '@/components/ui/button';

interface AddToRoutineModalProps {
  isOpen: boolean;
  routines: Routine[]; // ✨ 이 줄을 추가하여 routines 데이터를 받을 수 있도록 합니다.
  onClose: () => void;
  onSelectRoutine: (routineId: number) => void;
}

const AddToRoutineModal: React.FC<AddToRoutineModalProps> = ({ isOpen, routines, onClose, onSelectRoutine }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">루틴에 추가</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {routines.length > 0 ? (
            routines.map(routine => (
              <button
                key={routine.id}
                onClick={() => onSelectRoutine(routine.id)}
                className="w-full text-left p-3 rounded-md hover:bg-gray-100"
              >
                {routine.name}
              </button>
            ))
          ) : (
            <p className="text-gray-500">생성된 루틴이 없습니다.</p>
          )}
        </div>
        <div className="mt-6 text-right">
          <Button variant="secondary" onClick={onClose}>취소</Button>
        </div>
      </div>
    </div>
  );
};

export default AddToRoutineModal;