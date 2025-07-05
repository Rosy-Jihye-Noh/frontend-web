import React from 'react';
import { Button } from '../ui/button';
import type { PostDTO } from '../../types/community';

interface PostActionsProps {
  post: PostDTO;
  currentUserId?: number;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  post,
  currentUserId,
  onBack,
  onEdit,
  onDelete
}) => {
  const isAuthor = currentUserId && post.userId === currentUserId;

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onBack}
        className="flex-1 sm:flex-none"
      >
        목록으로
      </Button>
      
      {/* 수정/삭제 버튼: 작성자만 노출 */}
      {isAuthor && (
        <>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onEdit}
            className="flex-1 sm:flex-none"
          >
            수정
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={onDelete}
            className="flex-1 sm:flex-none"
          >
            삭제
          </Button>
        </>
      )}
    </div>
  );
};

export default PostActions; 