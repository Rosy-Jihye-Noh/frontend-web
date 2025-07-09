import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number; // 현재 페이지(0부터 시작)
  totalPages: number;  // 전체 페이지 수
  onPageChange: (page: number) => void; // 페이지 변경 핸들러
}

// CustomPagination: 페이지네이션 UI 컴포넌트
// - currentPage: 현재 페이지(0부터 시작)
// - totalPages: 전체 페이지 수
// - onPageChange: 페이지 변경 시 호출되는 콜백
// 최대 5개의 페이지 번호를 보여주며, 양쪽에 ... 표시 및 처음/끝 이동 지원
const CustomPagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const MAX_VISIBLE_PAGES = 5; // 한 번에 보여줄 최대 페이지 번호 개수
  
  if (totalPages <= 1) {
    return null; // 페이지가 하나 이하면 렌더링하지 않음
  }

  // 현재 페이지를 기준으로 표시할 페이지 번호 배열 생성
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
  const showStartEllipsis = pageNumbers[0] > 0; // 앞쪽 ... 표시 여부
  const showEndEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages - 1; // 뒤쪽 ... 표시 여부

  return (
    <Pagination className="w-full">
      <PaginationContent className="gap-0.5">
        {/* 이전 페이지 버튼 */}
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            className={`h-7 px-2 text-xs ${currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
          />
        </PaginationItem>
        
        {/* 첫 페이지 및 ... 표시 */}
        {showStartEllipsis && (
          <>
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(0)}
                className="h-7 w-7 text-xs cursor-pointer"
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis className="h-7 w-7" />
            </PaginationItem>
          </>
        )}
        
        {/* 페이지 번호 버튼들 */}
        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => onPageChange(page)}
              isActive={currentPage === page}
              className="h-7 w-7 text-xs cursor-pointer"
            >
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        {/* ... 및 마지막 페이지 표시 */}
        {showEndEllipsis && (
          <>
            <PaginationItem>
              <PaginationEllipsis className="h-7 w-7" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(totalPages - 1)}
                className="h-7 w-7 text-xs cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        
        {/* 다음 페이지 버튼 */}
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            className={`h-7 px-2 text-xs ${currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination;