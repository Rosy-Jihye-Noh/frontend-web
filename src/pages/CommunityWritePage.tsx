import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { fetchCategories, createPost, updatePost, fetchPostDetail } from '../services/api/communityApi';
import type { PostDTO, CategoryDTO } from '../types/community';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { useUserStore } from '../store/userStore';
import Header from '../components/common/Header';
import { UploadCloud, X, ArrowLeft, Loader2 } from 'lucide-react';

const usePostForm = (isEdit: boolean, postId?: number, userId?: number) => {
  // ... (로직은 변경되지 않음)
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchCategories().then(setCategories); }, []);
  useEffect(() => { if (isEdit && postId && userId) { setLoading(true); fetchPostDetail(postId).then((post: PostDTO) => { if (post.userId !== userId) { throw new Error('수정 권한이 없습니다.'); } setTitle(post.title); setContent(post.content); setCategoryId(post.categoryId); setImageUrl(post.imageUrl || ''); }).catch(() => setError('게시글 정보를 불러오지 못했습니다.')).finally(() => setLoading(false)); } }, [isEdit, postId, userId]);
  
  const handleSubmit = async (e: React.FormEvent): Promise<{ success: boolean; postId?: number }> => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) { setError('제목, 내용, 카테고리를 모두 입력하세요.'); return { success: false }; }
    if (!userId) { setError('로그인이 필요합니다.'); return { success: false }; }
    setLoading(true);
    setError(null);
    try {
      const postData: Partial<PostDTO> = { userId, title, content, categoryId, imageUrl: imageUrl.trim() || undefined };
      if (isEdit && postId) {
        await updatePost(postId, postData);
        return { success: true, postId };
      } else {
        const result = await createPost(postData);
        let newId: number | null = null;
        if (typeof result === 'object' && result !== null && 'id' in result) { newId = Number((result as any).id); } else if (typeof result === 'number') { newId = result; } else if (typeof result === 'string' && !isNaN(Number(result))) { newId = Number(result); }
        if (!newId || isNaN(newId)) { throw new Error('글 작성에 실패했습니다. (id 반환 오류)'); }
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
        const res = await fetch('http://localhost:8081/api/cloudinary/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('이미지 업로드 실패');
        const url = await res.text();
        setImageUrl(url);
      } catch (err) {
        setError('이미지 업로드에 실패했습니다.');
      }
    }
  };

  return { categories, title, content, categoryId, imageUrl, loading, error, setTitle, setContent, setCategoryId, setImageUrl, handleSubmit, handleImageChange };
};

const CommunityWritePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const { user } = useUserStore();
  const userId = user?.id;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { categories, title, content, categoryId, imageUrl, loading, error, setTitle, setContent, setCategoryId, setImageUrl, handleSubmit, handleImageChange } = usePostForm(isEdit, Number(id), userId);

  const onSubmit = async (e: React.FormEvent) => {
    const result = await handleSubmit(e);
    if (result.success) {
      const returnPath = location.state?.from ? `/community/${result.postId}${location.state.from}` : `/community/${result.postId}`;
      navigate(returnPath);
    }
  };

  const handlePhotoUploadClick = () => { fileInputRef.current?.click(); };
  const handleCancel = () => {
    const returnPath = location.state?.from ? `/community${location.state.from}` : '/community';
    navigate(returnPath);
  };

  const inputStyles = "text-base border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/60 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900";

  return (
    <div className="bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8" style={{ paddingTop: 'var(--header-height, 110px)' }}>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isEdit ? '게시글 수정' : '새로운 글 작성'}</h1>
        </div>
        
        <form className="grid gap-8 bg-white dark:bg-neutral-800/40 p-8 rounded-2xl border border-gray-200/80 dark:border-neutral-800" onSubmit={onSubmit}>
          <div className="grid md:grid-cols-3 gap-6">
            <label className="md:col-span-1 text-base font-semibold text-gray-700 dark:text-neutral-300">카테고리</label>
            <div className="md:col-span-2">
              <Select value={categoryId?.toString() || ''} onValueChange={v => setCategoryId(Number(v))}>
                <SelectTrigger className={`w-full md:w-60 h-11 ${inputStyles}`}>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <label htmlFor="title" className="md:col-span-1 text-base font-semibold text-gray-700 dark:text-neutral-300">제목</label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요" className={`md:col-span-2 h-11 ${inputStyles}`} />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <label htmlFor="content" className="md:col-span-1 text-base font-semibold text-gray-700 dark:text-neutral-300">내용</label>
            <textarea
              id="content"
              className={`md:col-span-2 w-full min-h-[200px] rounded-md p-4 ${inputStyles}`}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <label className="md:col-span-1 text-base font-semibold text-gray-700 dark:text-neutral-300">이미지 (선택)</label>
            <div className="md:col-span-2">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              {!imageUrl ? (
                <div onClick={handlePhotoUploadClick} className="w-full border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-base text-gray-600 dark:text-neutral-400">클릭하거나 파일을 드래그하여 업로드</p>
                  <p className="text-sm text-gray-500 dark:text-neutral-500">PNG, JPG, GIF (최대 5MB)</p>
                </div>
              ) : (
                <div className="relative group">
                  <img src={imageUrl} alt="미리보기" className="w-full max-h-80 object-contain rounded-xl border border-gray-200 dark:border-neutral-700" />
                  <Button type="button" size="icon" variant="destructive" onClick={() => setImageUrl('')} className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {error && <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>}
          
          <div className="flex justify-end gap-3 mt-4 border-t border-gray-200 dark:border-neutral-700 pt-6">
            <Button type="button" variant="outline" size="lg" onClick={handleCancel} disabled={loading}>취소</Button>
            <Button type="submit" size="lg" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              {loading ? <Loader2 className="animate-spin" /> : (isEdit ? '수정하기' : '등록하기')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityWritePage;