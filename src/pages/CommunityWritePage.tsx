import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { fetchCategories, createPost, updatePost, fetchPostDetail } from '../services/api/communityApi';
import type { PostDTO, CategoryDTO } from '../types/community';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { useUserStore } from '../store/userStore';
import Header from '../components/common/Header';

// 커스텀 훅: 게시글 작성/수정 폼 관리
const usePostForm = (isEdit: boolean, postId?: number, userId?: number) => {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 로드
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // 수정 모드일 때 기존 게시글 정보 로드
  useEffect(() => {
    if (isEdit && postId && userId) {
      setLoading(true);
      fetchPostDetail(postId)
        .then((post: PostDTO) => {
          if (post.userId !== userId) {
            throw new Error('수정 권한이 없습니다.');
          }
          setTitle(post.title);
          setContent(post.content);
          setCategoryId(post.categoryId);
          setImageUrl(post.imageUrl || '');
        })
        .catch(() => setError('게시글 정보를 불러오지 못했습니다.'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, postId, userId]);

  const handleSubmit = async (e: React.FormEvent): Promise<{ success: boolean; postId?: number }> => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('제목, 내용, 카테고리를 모두 입력하세요.');
      return { success: false };
    }
    if (!userId) {
      setError('로그인이 필요합니다.');
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const postData: Partial<PostDTO> = {
        userId,
        title,
        content,
        categoryId,
        imageUrl: imageUrl.trim() || undefined,
      };

      if (isEdit && postId) {
        await updatePost(postId, postData);
        return { success: true, postId };
      } else {
        const result = await createPost(postData);
        let newId: number | null = null;
        
        if (typeof result === 'object' && result !== null && 'id' in result) {
          newId = Number((result as any).id);
        } else if (typeof result === 'number') {
          newId = result;
        } else if (typeof result === 'string' && !isNaN(Number(result))) {
          newId = Number(result);
        }
        
        if (!newId || isNaN(newId)) {
          throw new Error('글 작성에 실패했습니다. (id 반환 오류)');
        }
        
        return { success: true, postId: newId };
      }
    } catch (e) {
      setError('글 작성에 실패했습니다.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('http://localhost:8081/api/cloudinary/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('이미지 업로드 실패');
        const url = await res.text();
        setImageUrl(url);
      } catch (err) {
        setError('이미지 업로드에 실패했습니다.');
      }
    }
  };

  return {
    categories,
    title,
    content,
    categoryId,
    imageUrl,
    loading,
    error,
    setTitle,
    setContent,
    setCategoryId,
    setImageUrl,
    handleSubmit,
    handleImageChange
  };
};

const CommunityWritePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const { user } = useUserStore();
  const userId = user?.id;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 커스텀 훅 사용
  const {
    categories,
    title,
    content,
    categoryId,
    imageUrl,
    loading,
    error,
    setTitle,
    setContent,
    setCategoryId,
    setImageUrl,
    handleSubmit,
    handleImageChange
  } = usePostForm(isEdit, Number(id), userId);

  const onSubmit = async (e: React.FormEvent) => {
    const result = await handleSubmit(e);
    if (result.success) {
      const returnPath = location.state?.from 
        ? `/community/${result.postId}${location.state.from}` 
        : `/community/${result.postId}`;
      navigate(returnPath);
    }
  };

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    const returnPath = location.state?.from ? `/community${location.state.from}` : '/community';
    navigate(returnPath);
  };

  return (
    <div>
      <Header />
      <div className="max-w-2xl mx-auto py-8 px-2 mt-16">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? '게시글 수정' : '게시글 작성'}</h1>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div>
            <label className="block mb-1 font-medium">카테고리</label>
            <Select value={categoryId?.toString() || ''} onValueChange={v => setCategoryId(Number(v))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">제목</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요" />
          </div>
          <div>
            <label className="block mb-1 font-medium">내용</label>
            <textarea
              className="w-full min-h-[120px] rounded-md border px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">이미지 (선택)</label>
            <Button type="button" onClick={handlePhotoUploadClick}>
              사진 업로드
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            {imageUrl && (
              <img src={imageUrl} alt="미리보기" className="mt-2 max-h-40 rounded" />
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 mt-2">
            <Button type="submit" disabled={loading}>{isEdit ? '수정' : '등록'}</Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>취소</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityWritePage; 