import React from 'react';
import { CardHeader, CardTitle } from '../ui/card';
import type { PostDTO } from '../../types/community';

interface PostHeaderProps {
  post: PostDTO;
}

const PostHeader: React.FC<PostHeaderProps> = ({ post }) => {
  return (
    <CardHeader>
      <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
      <div className="flex flex-col gap-1 sm:flex-row sm:gap-2 text-sm text-muted-foreground">
        {/* 첫 번째 줄: 작성자와 카테고리 */}
        <div className="flex items-center justify-between sm:justify-start sm:gap-2">
          <span className="font-medium">{post.userName}</span>
          <span className="hidden sm:inline">|</span>
          <span className="text-blue-600 font-medium">{post.categoryName}</span>
          <span className="hidden sm:inline">|</span>
        </div>
        {/* 두 번째 줄: 날짜 */}
        <div className="text-xs sm:text-sm">
          {new Date(post.createdAt).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </CardHeader>
  );
};

export default PostHeader; 