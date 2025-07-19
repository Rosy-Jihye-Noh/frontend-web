// PostCounter: 게시글의 좋아요/댓글/조회수 카운트와 좋아요 버튼을 표시하는 컴포넌트
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
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 14 : 16;
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';
  const gap = size === 'sm' ? 'gap-3' : 'gap-4';

  const baseClasses = `flex items-center transition-colors ${textSize} text-gray-500 dark:text-neutral-500`;
  const numberClasses = "ml-1.5 font-semibold tabular-nums";

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Like Button/Count */}
      {showLikeButton && onLikeClick ? (
        <button
          type="button"
          className={`${baseClasses} hover:text-blue-500 disabled:opacity-50`}
          onClick={onLikeClick}
          disabled={likeLoading}
          aria-pressed={isLiked}
          aria-label={isLiked ? '좋아요 취소' : '좋아요'}
        >
          <Heart
            size={iconSize}
            className={`transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''} ${likeLoading ? 'animate-pulse' : ''}`}
          />
          <span className={numberClasses}>{likeCount}</span>
        </button>
      ) : (
        <span className={baseClasses}>
          <Heart
            size={iconSize}
            className={isLiked ? 'fill-red-500 text-red-500' : ''}
          />
          <span className={numberClasses}>{likeCount}</span>
        </span>
      )}

      {/* Comment Count */}
      <span className={baseClasses}>
        <MessageCircle size={iconSize} />
        <span className={numberClasses}>{commentCount}</span>
      </span>

      {/* View Count */}
      <span className={baseClasses}>
        <Eye size={iconSize} />
        <span className={numberClasses}>{viewCount}</span>
      </span>
    </div>
  );
};

export default PostCounter;