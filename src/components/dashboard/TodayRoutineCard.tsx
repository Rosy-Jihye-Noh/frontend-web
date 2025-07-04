import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { HiCheckCircle, HiTrendingUp, HiPlus } from 'react-icons/hi';
import type { Routine } from '@/types/index';

interface TodayWorkoutCardProps {
  selectedRoutines: Routine[];
  allUserRoutines: Routine[];
  onRoutineSelect: (routines: Routine[]) => void;
  onStart: () => void;
}

const TodayWorkoutCard: React.FC<TodayWorkoutCardProps> = ({ 
  selectedRoutines, 
  allUserRoutines, 
  onRoutineSelect, 
  onStart 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempSelectedRoutines, setTempSelectedRoutines] = useState<Routine[]>(selectedRoutines);

  const hasSelectedRoutines = selectedRoutines.length > 0;

  const handleRoutineToggle = (routine: Routine) => {
    setTempSelectedRoutines(prev => 
      prev.some(r => r.id === routine.id) 
        ? prev.filter(r => r.id !== routine.id)
        : [...prev, routine]
    );
  };

  const handleConfirmSelection = () => {
    onRoutineSelect(tempSelectedRoutines);
    setIsDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setTempSelectedRoutines(selectedRoutines);
    setIsDialogOpen(true);
  };

  return (
    <div className="md:col-span-1 flex flex-col items-center justify-between !bg-blue-600 text-white dark:!bg-blue-700 p-6 shadow-lg rounded-lg transition-all duration-300">
      <HiCheckCircle className="text-white w-10 h-10 mb-2" />
      <h2 className="text-xl font-bold mb-2 text-center">오늘의 루틴</h2>
      
      {hasSelectedRoutines ? (
        <>
          <p className="text-base text-center mb-4">
            오늘의 루틴: {selectedRoutines.map(r => r.name).join(', ')} 루틴을 수행할 차례입니다
          </p>
          <div className="flex flex-col gap-2 w-full">
            <Button 
              className="bg-white !text-blue-600 font-semibold px-6 py-2 rounded-lg shadow cursor-pointer hover:bg-gray-100 transition-colors" 
              onClick={onStart}
            >
              운동 기록 시작하기 <HiTrendingUp className="w-5 h-5 ml-2" />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 transition-colors"
                  onClick={handleDialogOpen}
                >
                  루틴 변경
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>오늘 수행할 루틴을 선택하세요</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
                  {allUserRoutines.map(routine => (
                    <div 
                      key={routine.id} 
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors" 
                      onClick={() => handleRoutineToggle(routine)}
                    >
                      <Checkbox checked={tempSelectedRoutines.some(r => r.id === routine.id)} />
                      <span className="font-medium">{routine.name}</span>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleConfirmSelection} 
                    disabled={tempSelectedRoutines.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    선택 완료 ({tempSelectedRoutines.length}개)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : (
        <>
          <p className="text-base text-center mb-4">
            오늘 수행할 루틴을 선택해주세요
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="mt-auto bg-white !text-blue-600 font-semibold px-6 py-2 rounded-lg shadow cursor-pointer hover:bg-gray-100 transition-colors" 
                onClick={handleDialogOpen}
              >
                오늘 루틴 선택 <HiPlus className="w-5 h-5 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>오늘 수행할 루틴을 선택하세요</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
                {allUserRoutines.map(routine => (
                  <div 
                    key={routine.id} 
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors" 
                    onClick={() => handleRoutineToggle(routine)}
                  >
                    <Checkbox checked={tempSelectedRoutines.some(r => r.id === routine.id)} />
                    <span className="font-medium">{routine.name}</span>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleConfirmSelection} 
                  disabled={tempSelectedRoutines.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  선택 완료 ({tempSelectedRoutines.length}개)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default TodayWorkoutCard; 