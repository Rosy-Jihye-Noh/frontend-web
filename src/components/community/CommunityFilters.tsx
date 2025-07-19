// CommunityFilters: 커뮤니티 목록에서 카테고리, 정렬, 검색, 글쓰기 기능을 제공하는 필터 컴포넌트
import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, PenSquare } from 'lucide-react';
import type { CategoryDTO } from '../../types/community';

interface CommunityFiltersProps {
  categories: CategoryDTO[];
  currentCategory: string;
  currentSort: 'latest' | 'popular';
  searchValue: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: 'latest' | 'popular') => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onWriteClick: () => void;
}

const CommunityFilters: React.FC<CommunityFiltersProps> = ({
  categories,
  currentCategory,
  currentSort,
  searchValue,
  onCategoryChange,
  onSortChange,
  onSearchChange,
  onSearchSubmit,
  onWriteClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <Tabs value={currentCategory} onValueChange={onCategoryChange}>
        <TabsList className="grid w-full grid-cols-1 h-auto sm:w-auto sm:inline-flex bg-gray-100 dark:bg-neutral-800/60 p-1 rounded-xl">
          <TabsTrigger value="전체" className="rounded-lg">전체</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.name} className="rounded-lg">
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Action Bar: Sort, Search, Write */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Sort Buttons in a rounded container */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-neutral-800/60 self-start md:self-center">
          <Button
            variant={currentSort === 'latest' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-full px-4 transition-all duration-300"
            onClick={() => onSortChange('latest')}
          >
            최신순
          </Button>
          <Button
            variant={currentSort === 'popular' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-full px-4 transition-all duration-300"
            onClick={() => onSortChange('popular')}
          >
            인기순
          </Button>
        </div>

        {/* Search Form */}
        <form
          className="relative flex-1 w-full md:max-w-sm"
          onSubmit={onSearchSubmit}
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-neutral-500" />
          <Input
            className="pl-10 text-base border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="제목, 내용으로 검색해보세요"
          />
        </form>

        {/* Write Button with Icon */}
        <Button
          onClick={onWriteClick}
          className="w-full md:w-auto bg-gradient-to-br from-blue-400 to-blue-800 hover:from-blue-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md text-base px-5 py-5"
        >
          <PenSquare className="mr-2 h-4 w-4" />
          글쓰기
        </Button>
      </div>
    </div>
  );
};

export default CommunityFilters;