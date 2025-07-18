import React from 'react';

const RecommendedExercisesLoader: React.FC = () => {
  return (
    <section className="mb-12 p-6 bg-blue-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mb-4"></div>
      <div className="mb-6 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 스켈레톤 카드 3개 */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-700/50 rounded-xl p-4 space-y-4">
            <div className="h-40 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-md w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedExercisesLoader;