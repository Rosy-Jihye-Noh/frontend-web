// PostCard: 커뮤니티 게시글 목록에서 단일 게시글을 카드 형태로 보여주는 컴포넌트
import React from 'react';
import { Card } from '../ui/card';
import PostCounter from './PostCounter';
import type { PostDTO } from '../../types/community';

interface PostCardProps {
  post: PostDTO; // 게시글 정보
  isLiked: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
  likeLoading: boolean; // 좋아요 처리 중 여부(로딩 표시용)
  onLikeClick: (e: React.MouseEvent) => void; // 좋아요 클릭 핸들러
  onClick: () => void; // 카드 클릭(상세 이동 등)
  showLikeButton?: boolean; // 좋아요 버튼 노출 여부(선택)
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
      {/* 게시글 텍스트/이미지 영역 */}
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
        {/* 게시글 이미지(있을 때만) */}
        {post.imageUrl && (
          <div 
            className="w-16 h-16 ml-2 flex-shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden"
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
      {/* 게시글 작성자/카운터(좋아요, 댓글, 조회수) 영역 */}
      <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t">
        <div className="flex items-center gap-4">
          <span>{post.userName}</span>
        </div>
        {/* PostCounter: 좋아요/댓글/조회수 및 좋아요 버튼 */}
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