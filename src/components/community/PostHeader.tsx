// PostHeader: 게시글 상세 상단에 제목, 작성자, 카테고리, 작성일을 보여주는 컴포넌트
import React from 'react';
import { CardHeader, CardTitle } from '../ui/card';
import { Tag, User, Calendar } from 'lucide-react';
import type { PostDTO } from '../../types/community';

interface PostHeaderProps {
  post: PostDTO;
}

const PostHeader: React.FC<PostHeaderProps> = ({ post }) => {
  return (
    <CardHeader className="p-4 sm:p-6 space-y-4">
      {/* Post Title */}
      <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
        {post.title}
      </CardTitle>

      {/* Meta Information with Icons */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-gray-500 dark:text-neutral-400 pt-2">
        <div className="flex items-center gap-2 font-semibold">
          <Tag className="h-4 w-4 text-blue-500" />
          <span className="text-blue-600 dark:text-blue-400">{post.categoryName}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="font-medium text-gray-700 dark:text-neutral-300">{post.userName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(post.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </CardHeader>
  );
};

export default PostHeader;