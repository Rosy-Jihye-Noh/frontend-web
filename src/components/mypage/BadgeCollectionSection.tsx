// BadgeCollectionSection.tsx
import React from 'react';
import type { Badge as BadgeType } from '@/types/index';
import { Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface BadgeCollectionSectionProps {
  badges: {
    id: number;
    badge_name: string;
    badge_description: string;
    imageUrl: string | null;
    createdAt: string;
  }[];
}

const BadgeCollectionSection: React.FC<BadgeCollectionSectionProps> = ({ badges }) => {
  return (
    <Card className="rounded-2xl shadow-lg p-6">
      <CardHeader className="p-0 mb-6 flex flex-row justify-between items-center">
        <CardTitle className="text-2xl font-bold">내 뱃지 컬렉션</CardTitle>
        <span className="font-bold text-lg text-blue-500">{badges.length}개</span>
      </CardHeader>
      
      <CardContent className="p-0">
        {badges.length > 0 ? (
          <TooltipProvider>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-8">
              {badges.map((badge) => (
                <Tooltip key={badge.id} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center text-center cursor-pointer group">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 transform transition-transform duration-300 group-hover:scale-110">
                        {badge.imageUrl ? (
                          <img
                            src={badge.imageUrl}
                            alt={badge.badge_name}
                            className="w-full h-full rounded-full object-cover shadow-lg border-4 border-card group-hover:border-yellow-400 transition-all"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-muted flex items-center justify-center shadow-lg border-4 border-card group-hover:border-blue-400 transition-colors">
                            <Award className="w-12 h-12 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <h4 className="mt-4 font-semibold text-sm text-foreground w-full truncate">{badge.badge_name}</h4>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-gray-900 text-white rounded-lg p-3 text-center shadow-xl" side="bottom">
                    <p className="font-bold">{badge.badge_name}</p>
                    <p className="text-xs text-neutral-300">{badge.badge_description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/30">
            <Award className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-4 text-md font-medium text-foreground">아직 획득한 뱃지가 없습니다</h3>
            <p className="mt-1 text-sm text-neutral-500">꾸준히 활동하여 멋진 뱃지를 모아보세요!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgeCollectionSection;