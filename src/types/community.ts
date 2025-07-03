export interface PostDTO {
  id: number;
  createdAt: string;
  updatedAt: string;
  useYn: string;
  userId: number;
  userName: string;
  categoryId: number;
  categoryName: string;
  title: string;
  content: string;
  imageUrl: string;
  likeCount: number;
}

export interface CommentDTO {
  id: number;
  createdAt: string;
  updatedAt: string;
  useYn: string;
  userId: number;
  userName: string;
  postId: number;
  postTitle: string;
  content: string;
}

export interface CategoryDTO {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
}

export interface PostLikeDTO {
  userId: number;
  userName: string;
  postId: number;
  postTitle: string;
} 