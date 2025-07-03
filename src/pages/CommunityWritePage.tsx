import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCategories, createPost, updatePost, fetchPostDetail } from '../services/api/communityApi';
import type { PostDTO, CategoryDTO } from '../types/community';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { useUserStore } from '../store/userStore';
import Header from '../components/common/Header';

const CommunityWritePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useUserStore();
  const userId = user?.id;

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
    if (isEdit && id) {
      setLoading(true);
      fetchPostDetail(Number(id))
        .then((post: PostDTO) => {
          if (!userId || post.userId !== userId) {
            alert('수정 권한이 없습니다.');
            navigate('/community');
            return;
          }
          setTitle(post.title);
          setContent(post.content);
          setCategoryId(post.categoryId);
          setImageUrl(post.imageUrl || '');
        })
        .catch(() => setError('게시글 정보를 불러오지 못했습니다.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, userId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('제목, 내용, 카테고리를 모두 입력하세요.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const postData: Partial<PostDTO> = {
        title,
        content,
        categoryId,
        imageUrl: imageUrl.trim() || undefined,
        // userId 등은 백엔드에서 인증정보로 처리한다고 가정
      };
      if (isEdit && id) {
        await updatePost(Number(id), postData);
        navigate(`/community/${id}`);
      } else {
        const newId = await createPost(postData);
        navigate(`/community/${newId}`);
      }
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="max-w-2xl mx-auto py-8 px-2 mt-16">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? '게시글 수정' : '게시글 작성'}</h1>
        <form className="grid gap-4" onSubmit={handleSubmit}>
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
            <label className="block mb-1 font-medium">이미지 URL (선택)</label>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="이미지 URL을 입력하세요" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 mt-2">
            <Button type="submit" disabled={loading}>{isEdit ? '수정' : '등록'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>취소</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityWritePage; 