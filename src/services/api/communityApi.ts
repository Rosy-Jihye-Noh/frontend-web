import type { PostDTO, CategoryDTO, CommentDTO, PostCounterDTO } from '../../types/community';
import axiosInstance from '../../api/axiosInstance';

// 게시글 목록(최신순)
export const fetchPosts = async (page: number, size: number): Promise<{ content: PostDTO[], totalElements: number, totalPages: number }> => {
  try {
    const response = await axiosInstance.get(`/posts/paging?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw new Error('게시글 목록을 불러오는 데 실패했습니다.');
  }
};

// 게시글 목록(인기순)
export const fetchPopularPosts = async (page: number, size: number): Promise<{ content: PostDTO[], totalElements: number, totalPages: number }> => {
  try {
    const response = await axiosInstance.get(`/posts/paging/popular?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw new Error('인기 게시글 목록을 불러오는 데 실패했습니다.');
  }
};

// 카테고리별 게시글 목록(최신순)
export const fetchPostsByCategory = async (categoryId: number, page: number, size: number): Promise<{ content: PostDTO[], totalElements: number, totalPages: number }> => {
  try {
    const response = await axiosInstance.get(`/posts/category/${categoryId}?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw new Error('카테고리별 게시글 목록을 불러오는 데 실패했습니다.');
  }
};

// 카테고리별 게시글 목록(인기순)
export const fetchPopularPostsByCategory = async (categoryId: number, page: number, size: number): Promise<{ content: PostDTO[], totalElements: number, totalPages: number }> => {
  try {
    const response = await axiosInstance.get(`/posts/category/${categoryId}/popular?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw new Error('카테고리별 인기 게시글 목록을 불러오는 데 실패했습니다.');
  }
};

// 카테고리 목록
export const fetchCategories = async (): Promise<CategoryDTO[]> => {
  try {
    const response = await axiosInstance.get('/categories');
    return response.data;
  } catch (error) {
    throw new Error('카테고리 목록을 불러오는 데 실패했습니다.');
  }
};

// 게시글 검색
export const searchPosts = async (keyword: string): Promise<PostDTO[]> => {
  try {
    const response = await axiosInstance.get(`/posts/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  } catch (error) {
    throw new Error('게시글 검색에 실패했습니다.');
  }
};

// 게시글 상세
export const fetchPostDetail = async (id: number): Promise<PostDTO> => {
  try {
    const response = await axiosInstance.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('게시글을 불러오는 데 실패했습니다.');
  }
};

// 게시글 생성
export const createPost = async (data: Partial<PostDTO>): Promise<number> => {
  try {
    const response = await axiosInstance.post('/posts', data);
    return response.data;
  } catch (error) {
    throw new Error('게시글 생성에 실패했습니다.');
  }
};

// 게시글 수정
export const updatePost = async (id: number, data: Partial<PostDTO>): Promise<void> => {
  try {
    await axiosInstance.put(`/posts/${id}`, data);
  } catch (error) {
    throw new Error('게시글 수정에 실패했습니다.');
  }
};

// 게시글 삭제
export const deletePost = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/posts/${id}`);
  } catch (error) {
    throw new Error('게시글 삭제에 실패했습니다.');
  }
};

// 댓글 목록 (게시글별, 최신순)
export const fetchComments = async (postId: number, page: number, size: number): Promise<{ content: CommentDTO[], totalElements: number, totalPages: number }> => {
  try {
    const response = await axiosInstance.get(`/comments/post/${postId}?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw new Error('댓글 목록을 불러오는 데 실패했습니다.');
  }
};

// 댓글 생성
export const createComment = async (data: Partial<CommentDTO>): Promise<number> => {
  try {
    const response = await axiosInstance.post('/comments', data);
    return response.data;
  } catch (error) {
    throw new Error('댓글 생성에 실패했습니다.');
  }
};

// 댓글 수정
export const updateComment = async (id: number, data: Partial<CommentDTO>): Promise<void> => {
  try {
    await axiosInstance.put(`/comments/${id}`, data);
  } catch (error) {
    throw new Error('댓글 수정에 실패했습니다.');
  }
};

// 댓글 삭제
export const deleteComment = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/comments/${id}`);
  } catch (error) {
    throw new Error('댓글 삭제에 실패했습니다.');
  }
};

// 게시글 좋아요 생성
export const likePost = async (userId: number, postId: number): Promise<void> => {
  try {
    await axiosInstance.post('/post-likes', { userId, postId });
  } catch (error) {
    throw new Error('좋아요 추가에 실패했습니다.');
  }
};

// 게시글 좋아요 취소
export const unlikePost = async (userId: number, postId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/post-likes?userId=${userId}&postId=${postId}`);
  } catch (error) {
    throw new Error('좋아요 취소에 실패했습니다.');
  }
};

// 게시글 좋아요 여부 확인
export const checkPostLiked = async (userId: number, postId: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(`/post-likes/exists?userId=${userId}&postId=${postId}`);
    return response.data;
  } catch (error) {
    throw new Error('좋아요 여부 확인에 실패했습니다.');
  }
};

// 게시글 카운터 정보 조회 (PostCounter 엔티티 기반)
export const fetchPostCounter = async (postId: number): Promise<PostCounterDTO> => {
  try {
    const response = await axiosInstance.get(`/post-counters/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error('게시글 카운터 정보를 불러오는 데 실패했습니다.');
  }
};

// 게시글 좋아요 수만 조회 (PostCounter 기반)
export const fetchPostLikeCount = async (postId: number): Promise<number> => {
  try {
    const response = await axiosInstance.get(`/post-counters/${postId}/like-count`);
    return response.data;
  } catch (error) {
    throw new Error('좋아요 수를 불러오는 데 실패했습니다.');
  }
};

// 게시글 댓글 수만 조회 (PostCounter 기반)
export const fetchPostCommentCount = async (postId: number): Promise<number> => {
  try {
    const response = await axiosInstance.get(`/post-counters/${postId}/comment-count`);
    return response.data;
  } catch (error) {
    throw new Error('댓글 수를 불러오는 데 실패했습니다.');
  }
};

// 게시글 조회 수만 조회 (PostCounter 기반)
export const fetchPostViewCount = async (postId: number): Promise<number> => {
  try {
    const response = await axiosInstance.get(`/post-counters/${postId}/view-count`);
    return response.data;
  } catch (error) {
    throw new Error('조회 수를 불러오는 데 실패했습니다.');
  }
};

// 게시글 조회 수 증가
export const incrementPostViewCount = async (postId: number): Promise<void> => {
  try {
    await axiosInstance.post(`/post-counters/${postId}/view-count`);
  } catch (error) {
    throw new Error('조회 수 증가에 실패했습니다.');
  }
};

// 사용자별 작성 게시글 조회
export const fetchUserPosts = async (userId: number): Promise<PostDTO[]> => {
  try {
    const response = await axiosInstance.get(`/posts/user/${userId}`);
    
    // 페이지네이션 형태인지 직접 배열인지 확인
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.content)) {
      return response.data.content;
    }
    
    return [];
  } catch (error) {
    console.error('사용자 글 조회 실패:', error);
    return [];
  }
};

// 사용자별 작성 댓글 조회
export const fetchUserComments = async (userId: number): Promise<CommentDTO[]> => {
  try {
    const response = await axiosInstance.get(`/comments/user/${userId}`);
    
    // 페이지네이션 형태인지 직접 배열인지 확인
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.content)) {
      return response.data.content;
    }
    
    return [];
  } catch (error) {
    console.error('사용자 댓글 조회 실패:', error);
    return [];
  }
};

// 사용자 알림 조회
export const fetchUserNotifications = async (userId: number): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/notifications`);
    
    if (response.data && Array.isArray(response.data.content)) {
      return response.data.content.map((notif: any) => ({
        ...notif,
        postId: notif.referenceId, // referenceId를 postId로 매핑
        isRead: notif.read, // read를 isRead로 매핑
      }));
    } else if (response.data && Array.isArray(response.data)) {
      return response.data.map((notif: any) => ({
        ...notif,
        postId: notif.referenceId,
        isRead: notif.read,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('알림 조회 실패:', error);
    return [];
  }
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    await axiosInstance.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    throw new Error('알림 읽음 처리에 실패했습니다.');
  }
};

// 모든 알림 읽음 처리
export const markAllNotificationsAsRead = async (userId: number): Promise<void> => {
  try {
    await axiosInstance.patch(`/users/${userId}/notifications/read-all`);
  } catch (error) {
    throw new Error('모든 알림 읽음 처리에 실패했습니다.');
  }
};

// 알림 삭제
export const deleteNotification = async (notificationId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/notifications/${notificationId}`);
  } catch (error) {
    throw new Error('알림 삭제에 실패했습니다.');
  }
};

export async function fetchUserSignupStats(year: number) {
  const res = await axiosInstance.get(`/admin/user-signup-stats?year=${year}`);
  return res.data;
}

export async function fetchAdminDashboard() {
  const res = await axiosInstance.get('/admin/dashboard');
  return res.data;
}