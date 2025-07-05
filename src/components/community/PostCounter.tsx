import React from 'react';
import { Heart, Eye, MessageCircle } from 'lucide-react';

interface PostCounterProps {
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked?: boolean;
  onLikeClick?: (e: React.MouseEvent) => void;
  likeLoading?: boolean;
  showLikeButton?: boolean;
  size?: 'sm' | 'md';
}

const PostCounter: React.FC<PostCounterProps> = ({
  likeCount,
  commentCount,
  viewCount,
  isLiked = false,
  onLikeClick,
  likeLoading = false,
  showLikeButton = true,
  size = 'md'
}) => {
  const iconSize = size === 'sm' ? 16 : 18;
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-3">
      {showLikeButton && onLikeClick ? (
        <button
          type="button"
          className={`flex items-center ${textSize} text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50`}
          onClick={onLikeClick}
          disabled={likeLoading}
          aria-pressed={isLiked}
          aria-label={isLiked ? '좋아요 취소' : '좋아요'}
        >
          <Heart 
            className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} ${likeLoading ? 'animate-pulse' : ''}`} 
            size={iconSize} 
          />
          <span className="ml-1">{likeCount}</span>
        </button>
      ) : (
        <span className={`flex items-center ${textSize} text-muted-foreground`}>
          <Heart 
            className={isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} 
            size={iconSize} 
          />
          <span className="ml-1">{likeCount}</span>
        </span>
      )}
      
      <span className={`flex items-center ${textSize} text-muted-foreground`}>
        <MessageCircle size={iconSize} className="mr-1" />
        {commentCount}
      </span>
      
      <span className={`flex items-center ${textSize} text-muted-foreground`}>
        <Eye size={iconSize} className="mr-1" />
        {viewCount}
      </span>
    </div>
  );
};

export default PostCounter; 