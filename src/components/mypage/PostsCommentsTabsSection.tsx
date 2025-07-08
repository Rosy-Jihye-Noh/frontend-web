import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiChatAlt, HiThumbUp, HiClock } from 'react-icons/hi';
import type { UserPost, UserComment } from '@/types/index';
import { fetchUserPosts as fetchUserPostsApi, fetchUserComments as fetchUserCommentsApi } from '@/services/api/communityApi';
import axiosInstance from '@/api/axiosInstance';

interface PostsCommentsTabsProps {
  userId: number;
}

const PostsCommentsTabsSection: React.FC<PostsCommentsTabsProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserPosts = async () => {
    if (!userId) {
      console.warn('사용자 ID가 없습니다.');
      setPosts([]);
      return;
    }

    setIsLoading(true);
    try {
      // 로그인한 사용자의 글만 가져오기
      console.log('사용자', userId, '의 글을 가져오는 중...');
      const postsArray = await fetchUserPostsApi(userId);
      
      console.log('추출된 글 배열:', postsArray);
      console.log('사용자 작성 글 로드 성공:', postsArray.length, '개');
      
      // PostDTO를 UserPost 형태로 변환
      const formattedPosts = postsArray.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.userId,
        authorName: post.userName,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likesCount: post.likeCount || 0,
        commentsCount: 0, // 댓글 수는 별도로 가져와야 함
        category: post.categoryName
      }));
        
      console.log('변환된 posts:', formattedPosts);
        
      // 각 글의 댓글 수를 병렬로 가져오기
      const postsWithCommentCount = await Promise.all(
        formattedPosts.map(async (post: UserPost) => {
          try {
            const commentResponse = await axiosInstance.get(`/comments/post/${post.id}?page=0&size=1`);
            if (commentResponse.status === 200) {
              const commentData = commentResponse.data;
              const commentCount = commentData.totalElements || commentData.length || 0;
              return { ...post, commentsCount: commentCount };
            }
          } catch (error) {
            console.warn(`댓글 수 조회 실패 (글 ID: ${post.id}):`, error);
          }
          return post;
        })
      );
        
      console.log('댓글 수가 포함된 최종 posts:', postsWithCommentCount);
      setPosts(postsWithCommentCount);
    } catch (error) {
      console.error('사용자 글 API 호출 실패:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserComments = async () => {
    if (!userId) {
      console.warn('사용자 ID가 없습니다.');
      setComments([]);
      return;
    }

    setIsLoading(true);
    try {
      // 로그인한 사용자의 댓글만 가져오기
      console.log('사용자', userId, '의 댓글을 가져오는 중...');
      const commentsArray = await fetchUserCommentsApi(userId);
      
      console.log('추출된 댓글 배열:', commentsArray);
      console.log('사용자 작성 댓글 로드 성공:', commentsArray.length, '개');
      
      // CommentDTO를 UserComment 형태로 변환
      const formattedComments = commentsArray.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        postId: comment.postId,
        postTitle: comment.postTitle,
        authorId: comment.userId,
        authorName: comment.userName,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      }));
      
      console.log('변환된 comments:', formattedComments);
      setComments(formattedComments);
    } catch (error) {
      console.error('사용자 댓글 API 호출 실패:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchUserPosts();
    } else {
      fetchUserComments();
    }
  }, [activeTab, userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const TabButton = ({ 
    tab, 
    label, 
    count 
  }: { 
    tab: 'posts' | 'comments'; 
    label: string; 
    count: number; 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
        activeTab === tab 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-card text-blue-600 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      {label}
      <span className={`px-2 py-1 text-xs rounded-full ${
        activeTab === tab 
          ? 'bg-blue-500 text-white' 
          : 'bg-blue-100 text-blue-600'
      }`}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      <div className="flex gap-3 mb-6">
        <TabButton tab="posts" label="내 글" count={posts.length} />
        <TabButton tab="comments" label="내 댓글" count={comments.length} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2"></div>
            <p>로딩 중...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'posts' && (
            <>
              {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <HiChatAlt className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-500" />
                  <p className="text-lg font-medium mb-2">작성한 글이 없습니다.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    커뮤니티에서 첫 번째 글을 작성해보세요!
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/community/${post.id}`)}
                    className="p-4 border border-border rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <HiThumbUp className="w-3 h-3" />
                        {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiChatAlt className="w-3 h-3" />
                        {post.commentsCount}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'comments' && (
            <>
              {comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <HiChatAlt className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-500" />
                  <p className="text-lg font-medium mb-2">작성한 댓글이 없습니다.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    다른 사용자의 글에 댓글을 남겨보세요!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    onClick={() => navigate(`/community/${comment.postId}`)}
                    className="p-4 border border-border rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium line-clamp-1">
                        "{comment.postTitle}"에 댓글
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0 flex items-center gap-1">
                        <HiClock className="w-3 h-3" />
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">{comment.content}</p>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PostsCommentsTabsSection;
