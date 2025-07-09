// CommunityFilters: 커뮤니티 목록에서 카테고리, 정렬, 검색, 글쓰기 기능을 제공하는 필터 컴포넌트
import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import type { CategoryDTO } from '../../types/community';

interface CommunityFiltersProps {
  categories: CategoryDTO[]; // 카테고리 목록
  currentCategory: string; // 현재 선택된 카테고리
  currentSort: 'latest' | 'popular'; // 정렬 기준
  searchValue: string; // 검색어
  onCategoryChange: (category: string) => void; // 카테고리 변경 핸들러
  onSortChange: (sort: 'latest' | 'popular') => void; // 정렬 변경 핸들러
  onSearchChange: (value: string) => void; // 검색어 입력 핸들러
  onSearchSubmit: (e: React.FormEvent) => void; // 검색 폼 제출 핸들러
  onWriteClick: () => void; // 글쓰기 버튼 클릭 핸들러
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
      {/* 카테고리 탭: 전체/카테고리별 필터 */}
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          <button
            key="all"
            onClick={() => onCategoryChange('전체')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              currentCategory === '전체'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
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
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 정렬/검색/글쓰기 영역: 데스크톱/모바일 반응형 */}
      <div className="mb-4">
        {/* 데스크톱 레이아웃: 정렬, 검색, 글쓰기 버튼 */}
        <div className="hidden md:flex flex-row items-center gap-2 overflow-x-auto whitespace-nowrap">
          <button
            className={`px-3 py-1 rounded shrink-0 transition-colors ${
              currentSort === 'latest' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => onSortChange('latest')}
          >
            최신순
          </button>
          <button
            className={`px-3 py-1 rounded shrink-0 transition-colors ${
              currentSort === 'popular' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
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

        {/* 모바일 레이아웃: 정렬, 글쓰기, 검색 */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  currentSort === 'latest' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                }`}
                onClick={() => onSortChange('latest')}
              >
                최신순
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  currentSort === 'popular' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
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