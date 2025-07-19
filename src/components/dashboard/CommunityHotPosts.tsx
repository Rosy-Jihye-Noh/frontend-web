import React from 'react';
import { HiHeart } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CommunityHotPostsProps {
  categories: { key: string; icon: React.ReactNode }[];
  topPosts: { category: string; title: string; likes: number; id: number | null }[];
}

const CommunityHotPosts: React.FC<CommunityHotPostsProps> = ({ categories, topPosts }) => {
  const navigate = useNavigate();

  const handlePostClick = (postId: number | null) => {
    if (postId) {
      navigate(`/community/${postId}`);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {categories.map(({ key, icon }) => {
        const topPost = topPosts.find((item) => item.category === key);
        return (
          <Card
            key={key}
            className="flex p-4 shadow-md rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
            onClick={() => handlePostClick(topPost?.id || null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handlePostClick(topPost?.id || null)}
          >
            <div className="flex-grow flex items-center gap-4 min-w-0">
              {icon}
              <Badge variant="outline" className="border-[#007AFF]/50 text-[#007AFF] font-bold">
                {key}
              </Badge>
              {topPost ? (
                <>
                  <p className="font-semibold text-sm text-foreground truncate text-left flex-grow">{topPost.title}</p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto whitespace-nowrap">
                    <HiHeart className="w-4 h-4 text-red-500" />
                    <span className="font-medium">{topPost.likes}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm text-left flex-grow">아직 인기 게시글이 없습니다.</p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default CommunityHotPosts;