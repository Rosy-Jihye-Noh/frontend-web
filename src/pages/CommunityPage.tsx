import React, { useEffect, useState, useRef } from 'react';
import { fetchPosts, fetchPopularPosts, fetchPostsByCategory, fetchCategories, searchPosts, checkPostLiked, likePost, unlikePost } from '../services/api/communityApi';
import type { PostDTO, CategoryDTO } from '../types/community';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import Pagination from '../components/common/Pagination';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';

const PAGE_SIZE = 10;

const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(1);
  const [searching, setSearching] = useState(false);
  const [likedMap, setLikedMap] = useState<{ [postId: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [postId: number]: number }>({});
  const [likeLoading, setLikeLoading] = useState<{ [postId: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userId = 1; // TODO: 실제 로그인 유저로 교체
  const listRef = useRef<HTMLDivElement>(null);

  // 헤더 추가
  useEffect(() => {
    document.title = '커뮤니티 - Synergym';
  }, []);

  useEffect(() => {
    setCategoryError(null);
    fetchCategories()
      .then(data => setCategories(data))
      .catch(() => setCategoryError('카테고리 불러오기 실패'));
  }, []);

  useEffect(() => {
    setError(null);
    setSearching(true);

    if (keyword.trim()) {
      if (selectedCategory !== 'all') {
        // 카테고리+검색 (프론트 필터링)
        fetchPostsByCategory(Number(selectedCategory), page, PAGE_SIZE)
          .then(data => {
            let filtered = data.content || [];
            filtered = filtered.filter((post: PostDTO) =>
              post.title.includes(keyword) || post.content.includes(keyword)
            );
            setPosts(filtered);
            setTotalPages(1);
            setSearching(false);
          })
          .catch(() => {
            setError('게시글을 불러오지 못했습니다.');
            setSearching(false);
          });
      } else {
        // 전체+검색
        searchPosts(keyword)
          .then(data => {
            setPosts(data);
            setTotalPages(1);
            setSearching(false);
          })
          .catch(() => {
            setError('게시글을 불러오지 못했습니다.');
            setSearching(false);
          });
      }
      return;
    }

    setSearching(false);
    if (selectedCategory !== 'all') {
      // 카테고리별 인기/최신
      const fetchFn = sort === 'popular'
        ? fetchPostsByCategory // TODO: 백엔드에 인기순 API가 있으면 fetchPostsByCategoryPopular 사용
        : fetchPostsByCategory;
      fetchFn(Number(selectedCategory), page, PAGE_SIZE)
        .then(data => {
          setPosts(data.content || []);
          setTotalPages(data.totalPages || 1);
        })
        .catch(() => setError('게시글을 불러오지 못했습니다.'));
    } else {
      // 전체 인기/최신
      (sort === 'popular' ? fetchPopularPosts : fetchPosts)(page, PAGE_SIZE)
        .then(data => {
          setPosts(data.content || []);
          setTotalPages(data.totalPages || 1);
        })
        .catch(() => setError('게시글을 불러오지 못했습니다.'));
    }
  }, [selectedCategory, sort, page, keyword]);

  // 좋아요 상태/카운트
  useEffect(() => {
    if (posts.length === 0) return;
    const fetchLikedStates = async () => {
      const likedResults = await Promise.all(
        posts.map(post => checkPostLiked(userId, post.id))
      );
      const likeCountMap: { [postId: number]: number } = {};
      posts.forEach(post => {
        likeCountMap[post.id] = post.likeCount;
      });
      const map: { [postId: number]: boolean } = {};
      posts.forEach((post, idx) => {
        map[post.id] = likedResults[idx];
      });
      setLikedMap(map);
      setLikeCounts(likeCountMap);
    };
    fetchLikedStates();
  }, [posts]);

  // 페이지네이션 이동 시 스크롤 맨 위
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [page]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(0);
  };

  const handleSortChange = (value: string) => {
    setSort(value as 'latest' | 'popular');
    setPage(0);
  };

  const handleLikeClick = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    setLikeLoading(prev => ({ ...prev, [postId]: true }));
    const currentlyLiked = likedMap[postId];
    try {
      if (currentlyLiked) {
        await unlikePost(userId, postId);
        setLikedMap(prev => ({ ...prev, [postId]: false }));
        setLikeCounts(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 1) - 1) }));
      } else {
        await likePost(userId, postId);
        setLikedMap(prev => ({ ...prev, [postId]: true }));
        setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      }
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-16">
        <h1 className="text-3xl font-bold mb-6">커뮤니티</h1>
        <form className="flex flex-wrap gap-2 mb-4 items-end" onSubmit={handleSearch} aria-label="검색 및 필터">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-32" aria-label="카테고리 선택">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-28" aria-label="정렬 방식 선택">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="popular">인기순</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="w-full max-w-xs"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="제목/내용 검색"
            aria-label="검색어 입력"
          />
          <div className="flex-1 flex justify-end">
            <Button
              className="ml-auto"
              onClick={() => navigate('/community/write')}
              type="button"
            >
              글쓰기
            </Button>
          </div>
        </form>
        {categoryError && <div className="text-red-500 text-sm mb-2">{categoryError}</div>}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="bg-white rounded-xl shadow-sm p-4 grid gap-4 mb-6">
          {searching ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">게시글이 없습니다.</div>
          ) : (
            posts.map(post => (
              <Card
                key={post.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                tabIndex={0}
                aria-label={`게시글: ${post.title}`}
                onClick={() => navigate(`/community/${post.id}`)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/community/${post.id}`);
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="truncate max-w-xs">{post.title}</CardTitle>
                  <span className="text-xs text-muted-foreground">{post.categoryName}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-1">
                    {post.userName} | {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <div className="line-clamp-2 text-base">{post.content}</div>
                  {/* 썸네일 예시 */}
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="썸네일" className="w-24 h-16 object-cover rounded mt-2" />
                  )}
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs focus:outline-none"
                    aria-pressed={likedMap[post.id]}
                    onClick={e => handleLikeClick(e, post.id)}
                    disabled={likeLoading[post.id]}
                    tabIndex={0}
                    aria-label={likedMap[post.id] ? '좋아요 취소' : '좋아요'}
                  >
                    <Heart className={likedMap[post.id] ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} size={16} />
                    {likeCounts[post.id] ?? post.likeCount}
                  </button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={p => {
              setPage(p);
              if (listRef.current) listRef.current.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}
      </main>
    </div>
  );
};

export default CommunityPage; 