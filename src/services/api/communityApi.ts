import type { PostDTO, CategoryDTO, CommentDTO } from '../../types/community';

// 게시글 목록(최신순)
export const fetchPosts = (page: number, size: number) =>
  fetch(`http://localhost:8081/api/posts/paging?page=${page}&size=${size}`)
    .then(res => res.json());

// 게시글 목록(인기순)
export const fetchPopularPosts = (page: number, size: number) =>
  fetch(`http://localhost:8081/api/posts/paging/popular?page=${page}&size=${size}`)
    .then(res => res.json());

// 카테고리별 게시글 목록(최신순)
export const fetchPostsByCategory = (categoryId: number, page: number, size: number) =>
  fetch(`http://localhost:8081/api/posts/category/${categoryId}?page=${page}&size=${size}`)
    .then(res => res.json());

// 카테고리 목록
export const fetchCategories = (): Promise<CategoryDTO[]> =>
  fetch('http://localhost:8081/api/categories')
    .then(res => res.json());

// 게시글 검색
export const searchPosts = (keyword: string) =>
  fetch(`http://localhost:8081/api/posts/search?keyword=${encodeURIComponent(keyword)}`)
    .then(res => res.json());

// 게시글 상세
export const fetchPostDetail = (id: number) =>
  fetch(`http://localhost:8081/api/posts/${id}`)
    .then(res => res.json());

// 게시글 생성
export const createPost = (data: Partial<PostDTO>) =>
  fetch('http://localhost:8081/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(res => res.json());

// 게시글 수정
export const updatePost = (id: number, data: Partial<PostDTO>) =>
  fetch(`http://localhost:8081/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// 댓글 목록 (게시글별, 최신순)
export const fetchComments = (postId: number, page: number, size: number) =>
  fetch(`http://localhost:8081/api/comments/post/${postId}?page=${page}&size=${size}`)
    .then(res => res.json());

// 댓글 생성
export const createComment = (data: Partial<CommentDTO>) =>
  fetch('http://localhost:8081/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(res => res.json());

// 댓글 수정
export const updateComment = (id: number, data: Partial<CommentDTO>) =>
  fetch(`http://localhost:8081/api/comments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// 댓글 삭제
export const deleteComment = (id: number) =>
  fetch(`http://localhost:8081/api/comments/${id}`, {
    method: 'DELETE',
  });

// 게시글 좋아요 생성
export const likePost = (userId: number, postId: number) =>
  fetch('http://localhost:8081/api/post-likes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, postId }),
  });

// 게시글 좋아요 취소
export const unlikePost = (userId: number, postId: number) =>
  fetch(`http://localhost:8081/api/post-likes?userId=${userId}&postId=${postId}`, {
    method: 'DELETE',
  });

// 게시글 좋아요 여부 확인
export const checkPostLiked = (userId: number, postId: number) =>
  fetch(`http://localhost:8081/api/post-likes/exists?userId=${userId}&postId=${postId}`)
    .then(res => res.json());

// 게시글 좋아요 수 조회
export const fetchPostLikeCount = (postId: number) =>
  fetch(`http://localhost:8081/api/post-likes/count/post/${postId}`)
    .then(res => res.json());

// 게시글 삭제
export const deletePost = (id: number) =>
  fetch(`http://localhost:8081/api/posts/${id}`, {
    method: 'DELETE',
  }); 