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
        className="flex space-x-2 overflow-x-auto pb-2 "
        aria-label="운동 카테고리"
      >
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => onCategorySelect(category)}
            className="flex-shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>

    </div>
  );
};

export default ExerciseFilter;