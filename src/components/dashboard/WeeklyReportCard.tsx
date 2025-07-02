import React from 'react';
import { HiUser } from 'react-icons/hi';

const WeeklyReportCard: React.FC = () => (
  <div className="flex flex-col items-center p-6 shadow-lg rounded-lg">
    <HiUser className="text-blue-500 w-10 h-10 mb-2" />
    <h2 className="text-xl font-bold mb-4 text-center">주간 루틴 리포트</h2>
    <div className="w-full flex items-center justify-center bg-gray-100 rounded-lg h-60 text-gray-500">리포트 내용</div>
  </div>
);

export default WeeklyReportCard; 