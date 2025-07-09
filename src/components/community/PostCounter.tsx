// PostCounter: 게시글의 좋아요/댓글/조회수 카운트와 좋아요 버튼을 표시하는 컴포넌트
import React from 'react';
import { Heart, Eye, MessageCircle } from 'lucide-react';

interface PostCounterProps {
  likeCount: number;      // 좋아요 수
  commentCount: number;   // 댓글 수
  viewCount: number;      // 조회수
  isLiked?: boolean;      // 좋아요 여부(선택)
  onLikeClick?: (e: React.MouseEvent) => void; // 좋아요 클릭 핸들러(선택)
  likeLoading?: boolean;  // 좋아요 처리 중(선택)
  showLikeButton?: boolean; // 좋아요 버튼 노출 여부(선택)
  size?: 'sm' | 'md';     // 아이콘/텍스트 크기(sm|md, 기본 md)
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
      {/* 좋아요 버튼/카운트 */}
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
      
      {/* 댓글 카운트 */}
      <span className={`flex items-center ${textSize} text-muted-foreground`}>
        <MessageCircle size={iconSize} className="mr-1" />
        {commentCount}
      </span>
      
      {/* 조회수 카운트 */}
      <span className={`flex items-center ${textSize} text-muted-foreground`}>
        <Eye size={iconSize} className="mr-1" />
        {viewCount}
      </span>
    </div>
  );
};

export default PostCounter; 