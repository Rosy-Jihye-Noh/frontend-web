import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ExerciseFilter 컴포넌트가 받을 props의 타입
interface ExerciseFilterProps {
  searchTerm: string; // 현재 검색어
  onSearchTermChange: (value: string) => void; // 검색어 변경 함수
  selectedCategory: string; // 현재 선택된 카테고리
  onCategorySelect: (category: string) => void; // 카테고리 선택 함수
  categories: readonly string[]; // 모든 사용 가능한 카테고리 목록
}

// ExerciseFilter 함수형 컴포넌트를 정의합니다.
const ExerciseFilter: React.FC<ExerciseFilterProps> = ({
  searchTerm, // props로 전달받은 검색어
  onSearchTermChange, // props로 전달받은 검색어 변경 핸들러
  selectedCategory, // props로 전달받은 선택된 카테고리
  onCategorySelect, // props로 전달받은 카테고리 선택 핸들러
  categories, // props로 전달받은 카테고리 목록
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* 운동 이름 검색을 위한 입력 필드 */}
      <Input
        type="search"
        placeholder="운동 이름으로 검색"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="w-full"
      />
      {/* 운동 카테고리 버튼들을 담는 컨테이너 */}
      <div 
        className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide" // 가로 스크롤 가능하게 하고 스크롤바를 숨깁니다.
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
                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 shadow-md transform scale-105' // 선택된 카테고리 스타일
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm' // 기본 카테고리 스타일
            }`}
          >
            {category} {/* 버튼에 카테고리 이름을 표시합니다. */}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ExerciseFilter;