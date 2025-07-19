// PostCard: 커뮤니티 게시글 목록에서 단일 게시글을 카드 형태로 보여주는 컴포넌트
import React from 'react';
import { Card } from '../ui/card';
import PostCounter from './PostCounter';
import { Tag } from 'lucide-react';
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
  showLikeButton = true,
}) => {
  return (
    <Card
      className="p-6 rounded-2xl bg-white dark:bg-neutral-900/80 border border-gray-200/80 dark:border-neutral-800 backdrop-blur-sm shadow-lg hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out cursor-pointer group"
      tabIndex={0}
      aria-label={`게시글: ${post.title}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex flex-col justify-between h-full min-h-[150px]">
        {/* Post content area */}
        <div className="flex justify-between items-start gap-5">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full text-xs font-bold">
              <Tag size={14} />
              <span>{post.categoryName}</span>
            </div>
            <h3 className="font-bold text-lg md:text-xl mt-2.5 truncate text-gray-800 dark:text-gray-100">
              {post.title}
            </h3>
            <p className="text-base text-gray-600 dark:text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
              {post.content}
            </p>
          </div>
          {/* Post Image */}
          {post.imageUrl && (
            <div className="w-24 h-24 ml-4 flex-shrink-0 rounded-xl bg-gray-100 dark:bg-neutral-800 overflow-hidden shadow-inner">
              <img
                src={post.imageUrl}
                alt="게시글 썸네일"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
        </div>

        {/* Footer: Author and Counters */}
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-neutral-500 mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800/80">
          <span className="font-semibold text-gray-700 dark:text-neutral-300">{post.userName}</span>
          <PostCounter
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            viewCount={post.viewCount}
            isLiked={isLiked}
            onLikeClick={onLikeClick}
            likeLoading={likeLoading}
            showLikeButton={showLikeButton}
            size="md"
          />
        </div>
      </div>
    </Card>
  );
};

export default PostCard;