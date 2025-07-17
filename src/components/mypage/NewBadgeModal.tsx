// src/components/mypage/NewBadgeModal.tsx

import React from 'react';
import Confetti from 'react-confetti';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Badge as BadgeType } from '@/types/index';
import { Award } from 'lucide-react';

interface NewBadgeModalProps {
  badge: BadgeType;
  isOpen: boolean;
  onClose: () => void;
}

const NewBadgeModal: React.FC<NewBadgeModalProps> = ({ badge, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center overflow-hidden p-0">
        <Confetti
            width={440}
            height={450}
            recycle={false}
            numberOfPieces={250}
            gravity={0.15}
        />
        <div className="p-8">
            <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">🎉 새로운 뱃지 획득! 🎉</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
                축하합니다! 당신의 노력이 멋진 결실을 맺었습니다.
            </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center my-8 animate-fade-in-up">
                {badge.imageUrl ? (
                    <img
                        src={badge.imageUrl}
                        alt={badge.name}
                        className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-yellow-300"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-xl border-4 border-gray-400">
                        <Award className="w-16 h-16 text-gray-500" />
                    </div>
                )}
                <h3 className="text-xl font-bold text-foreground mt-5">{badge.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 px-4">{badge.description}</p>
            </div>

            <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700">
            확인하고 계속하기
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewBadgeModal;