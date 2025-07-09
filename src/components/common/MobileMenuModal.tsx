import React from 'react';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';

/**
 * 모바일 메뉴 모달 컴포넌트
 * - 모바일 환경에서 네비게이션 메뉴를 모달로 표시
 * - 바깥 클릭 시 닫힘, 닫기 버튼 제공
 * - children에 실제 메뉴 내용 렌더링
 */
interface MobileMenuModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MobileMenuModal: React.FC<MobileMenuModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="ml-auto w-64 bg-card shadow-lg flex flex-col p-6 gap-4 relative rounded-lg"
        style={{ maxHeight: '90vh', marginTop: '5vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
      >
        {/* 닫기 버튼 */}
        <button
          className="absolute top-4 right-4 p-2 cursor-pointer"
          onClick={onClose}
          aria-label="메뉴 닫기"
        >
          <HiX className="w-7 h-7" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default MobileMenuModal;