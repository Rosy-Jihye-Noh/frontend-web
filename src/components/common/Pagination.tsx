import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number; // 0-based index
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const MAX_VISIBLE_PAGES = 8;
  
  if (totalPages <= 1) {
    return null; // 페이지가 하나 이하면 렌더링하지 않음
  }

  const handlePrevious = () => {
    onPageChange(Math.max(0, currentPage - 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(totalPages - 1, currentPage + 1));
  };

  const getPageNumbers = () => {
    // 전체 페이지 수가 최대 표시 개수보다 적으면 모든 페이지 번호를 보여줌
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    // 현재 페이지를 중심으로 표시할 페이지 범위 계산
    let startPage = Math.max(0, currentPage - Math.floor((MAX_VISIBLE_PAGES - 1) / 2));
    let endPage = startPage + MAX_VISIBLE_PAGES - 1;

    // 계산된 마지막 페이지가 전체 페이지 수를 넘으면 조정
    if (endPage >= totalPages) {
      endPage = totalPages - 1;
      startPage = endPage - MAX_VISIBLE_PAGES + 1;
    }
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={currentPage === 0}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size="icon"
          onClick={() => onPageChange(page)}
          className="h-9 w-9"
        >
          {page + 1}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentPage === totalPages - 1}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default Pagination;