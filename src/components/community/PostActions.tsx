// PostActions: 게시글 상세에서 목록/수정/삭제 버튼을 제공하는 액션 컴포넌트
import React from 'react';
import { Button } from '../ui/button';
import { List, Pencil, Trash2 } from 'lucide-react';
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
  onDelete,
}) => {
  const isAuthor = currentUserId && post.userId === currentUserId;
  const buttonBaseStyles = 'font-semibold transition-all duration-200 active:scale-95 rounded-lg';

  return (
    <div className="flex items-center gap-3 w-full px-4 sm:px-6 py-4 mt-6 border-t border-gray-100 dark:border-neutral-800">
      <Button
        variant="outline"
        onClick={onBack}
        className={`${buttonBaseStyles} flex-1 sm:flex-none`}
      >
        <List className="mr-2 h-4 w-4" />
        목록
      </Button>

      <div className="flex-grow" />

      {/* Show Edit/Delete buttons only for the author */}
      {isAuthor && (
        <>
          <Button
            variant="ghost"
            onClick={onEdit}
            className={`${buttonBaseStyles} bg-gray-500/10 text-gray-600 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white`}
          >
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className={`${buttonBaseStyles} bg-red-500/10 text-red-600 hover:bg-red-500/20`}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </>
      )}
    </div>
  );
};

export default PostActions;