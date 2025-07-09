// PostActions: 게시글 상세에서 목록/수정/삭제 버튼을 제공하는 액션 컴포넌트
import React from 'react';
import { Button } from '../ui/button';
import type { PostDTO } from '../../types/community';

interface PostActionsProps {
  post: PostDTO;  // 게시글 정보
  currentUserId?: number; // 현재 로그인한 사용자 ID(작성자 여부 판별용)
  onBack: () => void; // 목록으로 이동 핸들러
  onEdit: () => void; // 수정 버튼 클릭 핸들러
  onDelete: () => void; // 삭제 버튼 클릭 핸들러
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