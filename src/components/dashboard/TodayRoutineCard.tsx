import React from 'react';
import { Button } from '@/components/ui/button';
import { HiCheckCircle, HiTrendingUp } from 'react-icons/hi';

interface TodayWorkoutCardProps {
  routineName: string;
  onStart: () => void;
}

const TodayWorkoutCard: React.FC<TodayWorkoutCardProps> = ({ routineName, onStart }) => (
  <div className="md:col-span-1 flex flex-col items-center justify-between !bg-blue-600 text-white dark:!bg-blue-700 p-6 shadow-lg rounded-lg">
    <HiCheckCircle className="text-white w-10 h-10 mb-2" />
    <h2 className="text-xl font-bold mb-2 text-center">오늘의 루틴</h2>
    <p className="text-base text-center mb-4">"{routineName}" 루틴을 수행할 차례입니다.</p>
    <Button className="mt-auto bg-white !text-blue-600 font-semibold px-6 py-2 rounded-lg shadow cursor-pointer hover:bg-gray-100" onClick={onStart}>
      운동 기록 시작하기 <HiTrendingUp className="w-5 h-5 ml-2" />
    </Button>
  </div>
);

export default TodayWorkoutCard; 