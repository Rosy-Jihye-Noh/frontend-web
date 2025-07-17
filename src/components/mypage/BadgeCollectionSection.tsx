// src/components/mypage/BadgeCollectionSection.tsx

import React from 'react';
import type { Badge as BadgeType } from '@/types/index';
import { Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeCollectionSectionProps {
  badges: BadgeType[];
}

const BadgeCollectionSection: React.FC<BadgeCollectionSectionProps> = ({ badges }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">내 뱃지 컬렉션</h2>
        <span className="font-semibold text-blue-600">{badges.length}개</span>
      </div>
      
      {badges.length > 0 ? (
        <TooltipProvider>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
            {badges.map((badge) => (
              <Tooltip key={badge.id} delayDuration={150}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center text-center cursor-pointer group">
                    <div className="relative w-28 h-28 transform transition-transform duration-300 group-hover:scale-110">
                      {badge.imageUrl ? (
                        <img
                          src={badge.imageUrl}
                          alt={badge.name}
                          className="w-full h-full rounded-full object-cover shadow-lg border-4 border-gray-100 dark:border-gray-700 group-hover:border-yellow-400 transition-colors"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-lg border-4 border-gray-300 dark:border-gray-600 group-hover:border-blue-400 transition-colors">
                          <Award className="w-14 h-14 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h4 className="mt-4 font-semibold text-sm text-foreground w-full truncate">{badge.name}</h4>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-gray-800 text-white rounded-md p-2 text-center" side="bottom">
                  <p>{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-gray-50/50 dark:bg-gray-900/20">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-md font-medium text-gray-700 dark:text-gray-300">아직 획득한 뱃지가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">꾸준히 활동하여 멋진 뱃지를 모아보세요!</p>
        </div>
      )}
    </div>
  );
};

export default BadgeCollectionSection;