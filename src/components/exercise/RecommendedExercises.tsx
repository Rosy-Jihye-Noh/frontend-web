import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import type { Exercise } from '@/types/index';

interface RecommendedExercisesProps {
  recommendedData: {
    exercises: Exercise[];
    reason: string;
  };
}

const RecommendedExercises: React.FC<RecommendedExercisesProps> = ({ recommendedData }) => {
  if (!recommendedData || recommendedData.exercises.length === 0) {
    return null;
  }


  return (
    <section className="mb-12 p-6 bg-blue-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">
        ✨ AI 맞춤 추천
      </h2>

      {/* AI의 추천 이유를 Markdown 형식으로 렌더링 */}
      <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
        <ReactMarkdown>{recommendedData.reason}</ReactMarkdown>
      </div>

      {/* 추천 운동을 넓적한 카드 형태로 렌더링 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedData.exercises.map((exercise) => (
          <Link
            to={`/exercises/${exercise.id}`}
            key={exercise.id}
            className="group block bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* 카드 썸네일 이미지 영역 */}
            <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 비율 컨테이너 */}
              {exercise.thumbnailUrl ? (
                <img
                  src={exercise.thumbnailUrl}
                  alt={exercise.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-sm text-center text-gray-500 p-2">{exercise.name}</span>
                </div>
              )}
            </div>

            {/* 카드 텍스트 정보 영역 */}
            <div className="p-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600">
                {exercise.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 h-10 overflow-hidden">
                {exercise.description || '이 운동에 대한 설명이 아직 없습니다.'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendedExercises;