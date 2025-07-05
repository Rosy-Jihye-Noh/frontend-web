import type { PostDTO, CategoryDTO, CommentDTO, PostCounterDTO } from '../../types/community';

// 게시글 목록(최신순)
export const fetchPosts = (page: number, size: number): Promise<{ content: PostDTO[], totalElements: number, totalPages: number }> =>
  fetch(`http://localhost:8081/api/posts/paging?page=${page}&size=${size}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 게시글 목록(인기순)
export const fetchPopularPosts = (page: number, size: number): Promise<{ content: PostDTO[], totalElements: number, totalPages: number }> =>
  fetch(`http://localhost:8081/api/posts/paging/popular?page=${page}&size=${size}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 카테고리별 게시글 목록(최신순)
export const fetchPostsByCategory = (categoryId: number, page: number, size: number): Promise<{ content: PostDTO[], totalElements: number, totalPages: number }> =>
  fetch(`http://localhost:8081/api/posts/category/${categoryId}?page=${page}&size=${size}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 카테고리별 게시글 목록(인기순)
export const fetchPopularPostsByCategory = (categoryId: number, page: number, size: number): Promise<{ content: PostDTO[], totalElements: number, totalPages: number }> =>
  fetch(`http://localhost:8081/api/posts/category/${categoryId}/popular?page=${page}&size=${size}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 카테고리 목록
export const fetchCategories = (): Promise<CategoryDTO[]> =>
  fetch('http://localhost:8081/api/categories')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 게시글 검색
export const searchPosts = (keyword: string): Promise<PostDTO[]> =>
  fetch(`http://localhost:8081/api/posts/search?keyword=${encodeURIComponent(keyword)}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 게시글 상세
export const fetchPostDetail = (id: number): Promise<PostDTO> =>
  fetch(`http://localhost:8081/api/posts/${id}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 게시글 생성
export const createPost = (data: Partial<PostDTO>): Promise<number> =>
  fetch('http://localhost:8081/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 게시글 수정
export const updatePost = (id: number, data: Partial<PostDTO>): Promise<void> =>
  fetch(`http://localhost:8081/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    });

// 게시글 삭제
export const deletePost = (id: number): Promise<void> =>
  fetch(`http://localhost:8081/api/posts/${id}`, {
    method: 'DELETE',
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    });

// 댓글 목록 (게시글별, 최신순)
export const fetchComments = (postId: number, page: number, size: number): Promise<{ content: CommentDTO[], totalElements: number, totalPages: number }> =>
  fetch(`http://localhost:8081/api/comments/post/${postId}?page=${page}&size=${size}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 댓글 생성
export const createComment = (data: Partial<CommentDTO>): Promise<number> =>
  fetch('http://localhost:8081/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 댓글 수정
export const updateComment = (id: number, data: Partial<CommentDTO>): Promise<void> =>
  fetch(`http://localhost:8081/api/comments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    });

// 댓글 삭제
export const deleteComment = (id: number): Promise<void> =>
  fetch(`http://localhost:8081/api/comments/${id}`, {
    method: 'DELETE',
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    });

// 게시글 좋아요 생성
export const likePost = (userId: number, postId: number): Promise<void> =>
  fetch('http://localhost:8081/api/post-likes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, postId }),
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    });

// 게시글 좋아요 취소
export const unlikePost = (userId: number, postId: number): Promise<void> =>
  fetch(`http://localhost:8081/api/post-likes?userId=${userId}&postId=${postId}`, {
    method: 'DELETE',
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    });

// 게시글 좋아요 여부 확인
export const checkPostLiked = (userId: number, postId: number): Promise<boolean> =>
  fetch(`http://localhost:8081/api/post-likes/exists?userId=${userId}&postId=${postId}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 게시글 카운터 정보 조회 (PostCounter 엔티티 기반)
export const fetchPostCounter = (postId: number): Promise<PostCounterDTO> =>
  fetch(`http://localhost:8081/api/post-counters/${postId}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 게시글 좋아요 수만 조회 (PostCounter 기반)
export const fetchPostLikeCount = (postId: number): Promise<number> =>
  fetch(`http://localhost:8081/api/post-counters/${postId}/like-count`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 게시글 댓글 수만 조회 (PostCounter 기반)
export const fetchPostCommentCount = (postId: number): Promise<number> =>
  fetch(`http://localhost:8081/api/post-counters/${postId}/comment-count`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 게시글 조회 수만 조회 (PostCounter 기반)
export const fetchPostViewCount = (postId: number): Promise<number> =>
  fetch(`http://localhost:8081/api/post-counters/${postId}/view-count`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

// 게시글 조회 수 증가
export const incrementPostViewCount = (postId: number): Promise<void> =>
  fetch(`http://localhost:8081/api/post-counters/${postId}/view-count`, {
    method: 'POST',
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    }); 