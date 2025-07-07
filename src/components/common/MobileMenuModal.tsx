import React from 'react';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';

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
        onClick={e => e.stopPropagation()}
      >
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