import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchPostDetail, fetchComments, createComment, updateComment, deleteComment, likePost, unlikePost, checkPostLiked, deletePost, incrementPostViewCount, fetchPostViewCount } from '../services/api/communityApi';
import type { PostDTO, CommentDTO } from '../types/community';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Pagination from '../components/common/Pagination';
import { PostHeader, PostCounter, PostActions } from '../components/community';
import { X, ZoomIn, Loader2, Send, CornerUpLeft, MessageSquare } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import Header from '../components/common/Header';

const COMMENT_PAGE_SIZE = 10;

const usePostDetail = (postId: number | undefined, userId: number | undefined) => {
    // ... (로직은 변경되지 않음)
    const [post, setPost] = useState<PostDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [viewCount, setViewCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);
    const incrementViewCount = async (postId: number) => { try { await incrementPostViewCount(postId); const updatedViewCount = await fetchPostViewCount(postId); setViewCount(updatedViewCount); } catch (error) { console.error('조회수 증가 실패:', error); } };
    const refreshViewCount = async (postId: number) => { try { const updatedViewCount = await fetchPostViewCount(postId); setViewCount(updatedViewCount); } catch (error) { console.error('조회수 새로고침 실패:', error); } };
    const loadPostDetail = async () => { if (!postId) return; setLoading(true); setError(null); try { const postData = await fetchPostDetail(postId); setPost(postData); setLikeCount(postData.likeCount); setCommentCount(postData.commentCount); setViewCount(postData.viewCount); await incrementViewCount(postId); } catch (error) { setError('게시글을 불러오지 못했습니다.'); } finally { setLoading(false); } };
    const handleLike = async () => { if (!postId || !userId) return; setLikeLoading(true); try { if (liked) { await unlikePost(userId, postId); setLikeCount(prev => Math.max(0, prev - 1)); } else { await likePost(userId, postId); setLikeCount(prev => prev + 1); } setLiked(!liked); } catch (err) { console.error('좋아요 처리 중 오류:', err); } finally { setLikeLoading(false); } };
    return { post, loading, error, liked, likeCount, commentCount, viewCount, likeLoading, loadPostDetail, handleLike, setLiked, setCommentCount, setViewCount, incrementViewCount, refreshViewCount };
};

const useComments = (postId: number | undefined, userId: number | undefined, setCommentCount: (value: number | ((prev: number) => number)) => void) => {
    // ... (로직은 변경되지 않음)
    const [comments, setComments] = useState<CommentDTO[]>([]);
    const [commentPage, setCommentPage] = useState(0);
    const [commentTotalPages, setCommentTotalPages] = useState(1);
    const [commentContent, setCommentContent] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [commentError, setCommentError] = useState<string | null>(null);
    const loadComments = async () => { if (!postId) return; setCommentError(null); try { const data = await fetchComments(postId, commentPage, COMMENT_PAGE_SIZE); if (data.content?.length === 0 && commentPage > 0 && data.totalPages > 0) { const newPage = Math.max(0, data.totalPages - 1); setCommentPage(newPage); return; } setComments(data.content || []); setCommentTotalPages(data.totalPages || 1); } catch { setCommentError('댓글을 불러오지 못했습니다.'); } };
    const handleCommentSubmit = async (e: React.FormEvent | React.KeyboardEvent) => { e.preventDefault(); if (!commentContent.trim() || !postId || !userId) return; setCommentLoading(true); try { await createComment({ postId, userId, content: commentContent }); setCommentContent(''); setCommentPage(0); await loadComments(); setCommentCount(prev => prev + 1); } catch {} finally { setCommentLoading(false); } };
    const handleDeleteComment = async (commentId: number) => { if (!window.confirm('댓글을 삭제하시겠습니까?')) return; try { await deleteComment(commentId); await loadComments(); setCommentCount(prev => Math.max(0, prev - 1)); } catch {} };
    const handleEditSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!editingCommentId || !editingContent.trim()) return; try { await updateComment(editingCommentId, { content: editingContent }); setEditingCommentId(null); setEditingContent(''); await loadComments(); } catch {} };
    return { comments, commentPage, commentTotalPages, commentContent, commentLoading, editingCommentId, editingContent, commentError, setCommentContent, setCommentPage, setEditingCommentId, setEditingContent, loadComments, handleCommentSubmit, handleDeleteComment, handleEditSubmit };
};

const CommunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();
  const userId = user?.id;
  
  const postId = Number(id);
  if (isNaN(postId) || postId <= 0) {
    return <div className="p-8 text-red-500 text-center">유효하지 않은 게시글 ID입니다.</div>;
  }
  
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');

  const { post, loading, error, liked, likeCount, commentCount, viewCount, likeLoading, loadPostDetail, handleLike, setLiked, setCommentCount } = usePostDetail(postId, userId);
  const { comments, commentPage, commentTotalPages, commentContent, commentLoading, editingCommentId, editingContent, commentError, setCommentContent, setCommentPage, setEditingCommentId, setEditingContent, loadComments, handleCommentSubmit, handleDeleteComment, handleEditSubmit } = useComments(postId, userId, setCommentCount);

  // ... (useEffect 로직은 변경되지 않음)
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [id]);
  useEffect(() => { loadPostDetail(); }, [postId]);
  useEffect(() => { if (!postId || !userId) return; checkPostLiked(userId, postId).then(setLiked).catch(err => console.error('좋아요 상태 로드 실패:', err)); }, [postId, userId]);
  useEffect(() => { loadComments(); }, [postId, commentPage]);
  useEffect(() => { if (editingCommentId) { /* Logic to focus on edit input if it exists */ } else { commentInputRef.current?.focus(); } }, [editingCommentId]);
  useEffect(() => { const handleEscKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseModal(); }; document.addEventListener('keydown', handleEscKey); return () => document.removeEventListener('keydown', handleEscKey); }, []);

  const handleImageClick = (imageUrl: string) => { setModalImageUrl(imageUrl); setShowImageModal(true); };
  const handleCloseModal = () => setShowImageModal(false);
  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) handleCommentSubmit(e); };
  const handleDeletePostWithPageAdjustment = async (postId: number, returnPath: string) => { if (!window.confirm('게시글을 삭제하시겠습니까?')) return; try { await deletePost(postId); alert('게시글이 삭제되었습니다.'); navigate(returnPath || '/community'); } catch { alert('게시글 삭제에 실패했습니다.'); } };
  const handleBack = () => navigate(location.state?.from ? `/community${location.state.from}` : '/community');
  const goToEdit = () => navigate(`/community/edit/${post?.id}`, { state: { from: location.state?.from || '' } });

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>;
  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;
  if (!post) return <div className="p-8 text-center">게시글이 없습니다.</div>;

  return (
    <div className="bg-gray-50 dark:bg-black">
      <Header />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8" style={{ paddingTop: 'var(--header-height, 110px)' }}>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-200/50 dark:border-neutral-800">
          <PostHeader post={post} />
          <CardContent className="px-4 sm:px-6 pt-4 pb-6">
            {post.imageUrl && (
              <div onClick={() => handleImageClick(post.imageUrl)} className="mb-6 w-full max-h-[500px] flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800 relative cursor-pointer group">
                <img src={post.imageUrl} alt="게시글 이미지" className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={40} />
                </div>
              </div>
            )}
            <div className="prose dark:prose-invert prose-lg max-w-none whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-4 sm:p-6 bg-gray-50/50 dark:bg-neutral-800/40 border-t dark:border-neutral-800">
            <div className="w-full flex justify-between items-center">
              <PostCounter likeCount={likeCount} commentCount={commentCount} viewCount={viewCount} isLiked={liked} onLikeClick={handleLike} likeLoading={likeLoading} />
            </div>
            <PostActions post={post} currentUserId={userId} onBack={handleBack} onEdit={goToEdit} onDelete={() => handleDeletePostWithPageAdjustment(post.id, location.state?.from)} />
          </CardFooter>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-gray-800 dark:text-neutral-200">
            <MessageSquare className="text-blue-500" /> 댓글 ({commentCount})
          </h2>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200/50 dark:border-neutral-800">
            <form className="flex gap-3 items-center" onSubmit={handleCommentSubmit}>
              <Input ref={commentInputRef} value={commentContent} onChange={e => setCommentContent(e.target.value)} onKeyDown={handleCommentKeyDown} placeholder="따뜻한 댓글을 남겨주세요." className="h-11 text-base" disabled={commentLoading} />
              <Button type="submit" size="icon" className="h-11 w-11 flex-shrink-0" disabled={commentLoading || !commentContent.trim()}>
                {commentLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>

            <div className="mt-6 space-y-5">
              {comments.map(comment => (
                <div key={comment.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-800 dark:text-neutral-200">{comment.userName}</span>
                    <span className="text-gray-400 dark:text-neutral-600">•</span>
                    <span className="text-gray-500 dark:text-neutral-500">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  {editingCommentId === comment.id ? (
                    <form className="flex gap-2 items-center" onSubmit={handleEditSubmit}>
                      <Input value={editingContent} onChange={e => setEditingContent(e.target.value)} className="h-10 text-base" autoFocus />
                      <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">저장</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>취소</Button>
                    </form>
                  ) : (
                    <p className="text-base text-gray-700 dark:text-neutral-300 whitespace-pre-wrap">{comment.content}</p>
                  )}
                  {comment.userId === userId && editingCommentId !== comment.id && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-xs" onClick={() => { setEditingCommentId(comment.id); setEditingContent(comment.content); }}>수정</Button>
                      <Button size="sm" variant="ghost" className="text-xs text-red-500 hover:text-red-600" onClick={() => handleDeleteComment(comment.id)}>삭제</Button>
                    </div>
                  )}
                </div>
              ))}
              {comments.length === 0 && !commentError && (
                <p className="text-center py-8 text-gray-500 dark:text-neutral-500">첫 댓글을 작성해보세요.</p>
              )}
              {commentError && <p className="text-center py-8 text-red-500">{commentError}</p>}
            </div>

            {commentTotalPages > 1 && (
              <div className="mt-8 border-t dark:border-neutral-800 pt-6">
                <Pagination currentPage={commentPage} totalPages={commentTotalPages} onPageChange={setCommentPage} />
              </div>
            )}
          </div>
        </div>
      </main>

      {showImageModal && (
        <div onClick={handleCloseModal} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <img src={modalImageUrl} alt="확대된 이미지" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()} />
          <Button onClick={handleCloseModal} variant="ghost" size="icon" className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 h-10 w-10">
            <X size={24} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommunityDetailPage;