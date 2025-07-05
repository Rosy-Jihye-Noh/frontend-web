import React from 'react';
import { Card } from '../ui/card';
import PostCounter from './PostCounter';
import type { PostDTO } from '../../types/community';

interface PostCardProps {
  post: PostDTO;
  isLiked: boolean;
  likeLoading: boolean;
  onLikeClick: (e: React.MouseEvent) => void;
  onClick: () => void;
  showLikeButton?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  isLiked,
  likeLoading,
  onLikeClick,
  onClick,
  showLikeButton = true
}) => {
  return (
    <Card
      className="!p-6 min-h-[132px] flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
      style={{ minHeight: '132px' }}
      tabIndex={0}
      aria-label={`게시글: ${post.title}`}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex justify-between items-start h-full">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-blue-500">
            {`[${post.categoryName}]`}
          </span>
          <h3 className="font-bold mt-1 truncate">{post.title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {post.content}
          </p>
        </div>
        {post.imageUrl && (
          <div 
            className="w-16 h-16 ml-2 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden"
            style={{
              width: '64px',
              height: '64px',
              minWidth: '64px',
              minHeight: '64px'
            }}
          >
            <img 
              src={post.imageUrl}
              alt="게시글 이미지"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/assets/logo.png';
              }}
            />
          </div>
        )}
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t">
        <div className="flex items-center gap-4">
          <span>{post.userName}</span>
        </div>
        <PostCounter
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          viewCount={post.viewCount}
          isLiked={isLiked}
          onLikeClick={(e) => onLikeClick(e)}
          likeLoading={likeLoading}
          showLikeButton={showLikeButton}
          size="sm"
        />
      </div>
    </Card>
  );
};

export default PostCard; 