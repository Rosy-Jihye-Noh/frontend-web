import React from 'react';
import type { Routine } from '@/types/index';
import { Button } from '../ui/button';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi'; // HiX 아이콘 추가

interface MyRoutinesSectionProps {
    routines: Routine[];
    onAddRoutine: () => void;
}

const MyRoutinesSection: React.FC<MyRoutinesSectionProps> = ({ routines, onAddRoutine }) => (
    <div className="space-y-6">
        {routines.map(routine => (
            <div key={routine.id} className="bg-white dark:bg-gray-800 p-6 border dark:border-gray-700 rounded-lg shadow-sm">
                {/* ✨ 2. 루틴 수정/삭제 버튼 */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{routine.name}</h3>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            <HiPencil className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-red-500/80 hover:text-red-500 rounded-md bg-red-100/80 dark:bg-red-900/40">
                            <HiTrash className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {routine.exercises.map((exercise) => ( // 'exercise'는 { exerciseId, exerciseName, order } 형태의 객체
                        <div key={exercise.exerciseId} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                            {/* ✨ 해결: exercise 객체의 'exerciseName' 프로퍼티를 렌더링 */}
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {exercise.exerciseName}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <HiX className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* ✨ 2. 운동 추가 버튼 */}
                <button className="mt-4 w-full flex items-center justify-center p-3 text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors">
                    <HiPlus className="w-4 h-4 mr-2" />
                    운동 추가하기
                </button>
            </div>
        ))}

        {/* ✨ 3. 새 루틴 추가하기 버튼 */}
        <Button
            onClick={onAddRoutine}
            className="w-full !py-3 !text-base !font-bold mt-6 bg-blue-600 text-white hover:bg-blue-700"
        >
            새 루틴 추가하기
        </Button>
    </div>
);

export default MyRoutinesSection;