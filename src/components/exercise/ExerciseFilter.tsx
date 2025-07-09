import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ExerciseFilterProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  categories: readonly string[];
}

const ExerciseFilter: React.FC<ExerciseFilterProps> = ({
  searchTerm,
  onSearchTermChange,
  selectedCategory,
  onCategorySelect,
  categories,
}) => {
  return (
    <div className="mb-6 space-y-4">
      <Input
        type="search"
        placeholder="운동 이름으로 검색"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="w-full"
      />
      <div 
        className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide"
        aria-label="운동 카테고리"
      >
        {/* 'categories' 배열을 순회하며 각 카테고리에 대한 버튼을 렌더링합니다. */}
        {categories.map((category) => (
          <Button
            key={category}
            variant="outline"
            onClick={() => onCategorySelect(category)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              selectedCategory === category 
                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 shadow-md transform scale-105' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm'
            }`}
          >
            {category}
          </Button>
        ))}
      </div>

    </div>
  );
};

export default ExerciseFilter;