import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
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
  onWriteClick
}) => {
  return (
    <>
      {/* 카테고리 탭 */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          <button
            key="all"
            onClick={() => onCategoryChange('전체')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              currentCategory === '전체'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            전체
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.name)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentCategory === cat.name
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 정렬/검색/글쓰기 */}
      <div className="mb-4">
        {/* 데스크톱 레이아웃 */}
        <div className="hidden md:flex flex-row items-center gap-2 overflow-x-auto whitespace-nowrap">
          <button
            className={`px-3 py-1 rounded shrink-0 transition-colors ${
              currentSort === 'latest' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            onClick={() => onSortChange('latest')}
          >
            최신순
          </button>
          <button
            className={`px-3 py-1 rounded shrink-0 transition-colors ${
              currentSort === 'popular' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            onClick={() => onSortChange('popular')}
          >
            인기순
          </button>
          <form className="flex gap-2 flex-1 min-w-[120px]" onSubmit={onSearchSubmit}>
            <Input
              className="w-full max-w-xs"
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="제목/내용 검색"
              aria-label="검색어 입력"
            />
            <Button type="submit" className="shrink-0">검색</Button>
          </form>
          <Button className="ml-auto bg-blue-600 shrink-0" onClick={onWriteClick}>
            글쓰기
          </Button>
        </div>

        {/* 모바일 레이아웃 */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  currentSort === 'latest' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => onSortChange('latest')}
              >
                최신순
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  currentSort === 'popular' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => onSortChange('popular')}
              >
                인기순
              </button>
            </div>
            
            <Button 
              className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={onWriteClick}
            >
              <span className="text-sm font-medium">글쓰기</span>
            </Button>
          </div>

          <form className="flex gap-2" onSubmit={onSearchSubmit}>
            <Input
              className="flex-1 text-sm"
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="제목/내용 검색"
              aria-label="검색어 입력"
            />
            <Button type="submit" className="px-4 py-2 text-sm">
              검색
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CommunityFilters; 