import React from 'react';
import type { Routine } from '@/types/index';
import { Button } from '@/components/ui/button';

// AddToRoutineModal 컴포넌트의 props 인터페이스
interface AddToRoutineModalProps {
  isOpen: boolean; // 모달의 열림/닫힘 상태
  routines: Routine[]; // 모달에 표시될 루틴 데이터 배열
  onClose: () => void; // 모달 닫기 요청 시 호출되는 콜백 함수
  onSelectRoutine: (routineId: number) => void; // 특정 루틴 선택 시 호출되는 콜백 함수 (선택된 루틴의 ID 전달)
}

// AddToRoutineModal 함수형 컴포넌트 정의
const AddToRoutineModal: React.FC<AddToRoutineModalProps> = ({ isOpen, routines, onClose, onSelectRoutine }) => {
  // `isOpen` prop이 false이면 모달을 렌더링하지 않고 null을 반환
  if (!isOpen) return null;

  // `isOpen`이 true일 경우 모달 UI 렌더링
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">루틴에 추가</h2>
        {/* 루틴 목록을 담는 스크롤 가능한 영역 */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {routines.length > 0 ? ( 
            routines.map(routine => (
              <button
                key={routine.id} 
                onClick={() => onSelectRoutine(routine.id)}
                className="w-full text-left p-3 rounded-md hover:bg-muted"
              >
                {routine.name}
              </button>
            ))
          ) : ( // 루틴이 하나도 없을 경우 메시지 표시
            <p className="text-gray-500">생성된 루틴이 없습니다.</p>
          )}
        </div>
        <div className="mt-6 text-right">
          {/* 취소 버튼 */}
          <Button variant="secondary" onClick={onClose}>취소</Button> {/* 클릭 시 onClose 콜백 호출하여 모달 닫기 */}
        </div>
      </div>
    </div>
  );
};

export default AddToRoutineModal;