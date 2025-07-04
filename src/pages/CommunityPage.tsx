import React, { useEffect, useState, useRef } from 'react';
import { fetchPosts, fetchPopularPosts, fetchPostsByCategory, fetchCategories, searchPosts, checkPostLiked, likePost, unlikePost } from '../services/api/communityApi';
import type { PostDTO, CategoryDTO } from '../types/community';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import Pagination from '../components/common/Pagination';
import { Heart } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import { useUserStore } from '@/store/userStore';

const PAGE_SIZE = 10;

const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [likedMap, setLikedMap] = useState<{ [postId: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [postId: number]: number }>({});
  const [likeLoading, setLikeLoading] = useState<{ [postId: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useUserStore();
  const userId = user?.id;
  const listRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [totalPages, setTotalPages] = useState(1);

  // 쿼리스트링에서 상태 추출
  const category = searchParams.get('category') || '전체';
  const sort = (searchParams.get('sort') as 'latest' | 'popular') || 'latest';
  const keyword = searchParams.get('keyword') || '';
  const page = Number(searchParams.get('page')) || 0;

  // 검색창 입력값과 쿼리스트링 동기화
  useEffect(() => {
    setSearchInputValue(keyword);
  }, [keyword]);

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = '커뮤니티 - Synergym';
  }, []);

  // 카테고리 로드
  useEffect(() => {
    setCategoryError(null);
    fetchCategories()
      .then(data => setCategories(data))
      .catch(() => setCategoryError('카테고리 불러오기 실패'));
  }, []);

  // 게시글 로드 (통합된 로직)
  useEffect(() => {
    const loadPosts = async () => {
      setError(null);
      setLoading(true);

      try {
        let data;
        
        // 검색 케이스
        if (keyword.trim()) {
          if (category !== '전체') {
            // 카테고리 + 검색: 백엔드에서 지원한다면 searchPostsByCategory 사용
            // 현재는 프론트엔드 필터링으로 대체
            const categoryId = categories.find(cat => cat.name === category)?.id;
            if (!categoryId) {
              setError('카테고리를 찾을 수 없습니다.');
              return;
            }
            
            // 전체 카테고리 데이터를 가져온 후 검색어로 필터링
            // 실제로는 백엔드에서 카테고리별 검색 API를 제공하는 것이 좋습니다
            const allCategoryPosts = await fetchPostsByCategory(categoryId, 0, 1000); // 임시로 큰 수
            const filteredPosts = allCategoryPosts.content?.filter((post: PostDTO) =>
              post.title.toLowerCase().includes(keyword.toLowerCase()) || 
              post.content.toLowerCase().includes(keyword.toLowerCase())
            ) || [];
            
            // 클라이언트 사이드 정렬
            if (sort === 'popular') {
              filteredPosts.sort((a: PostDTO, b: PostDTO) => b.likeCount - a.likeCount);
            } else {
              filteredPosts.sort((a: PostDTO, b: PostDTO) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
            
            // 클라이언트 사이드 페이지네이션
            const startIndex = page * PAGE_SIZE;
            const endIndex = startIndex + PAGE_SIZE;
            const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
            const calculatedTotalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
            
            data = {
              content: paginatedPosts,
              totalPages: calculatedTotalPages
            };
          } else {
            // 전체 검색
            const searchResults = await searchPosts(keyword);
            
            // 검색 결과 정렬
            if (sort === 'popular') {
              searchResults.sort((a: PostDTO, b: PostDTO) => b.likeCount - a.likeCount);
            } else {
              searchResults.sort((a: PostDTO, b: PostDTO) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
            
            // 검색 결과 페이지네이션
            const startIndex = page * PAGE_SIZE;
            const endIndex = startIndex + PAGE_SIZE;
            const paginatedResults = searchResults.slice(startIndex, endIndex);
            const calculatedTotalPages = Math.ceil(searchResults.length / PAGE_SIZE);
            
            data = {
              content: paginatedResults,
              totalPages: calculatedTotalPages
            };
          }
        } else {
          // 일반 조회 (검색어 없음)
          if (category !== '전체') {
            const categoryId = categories.find(cat => cat.name === category)?.id;
            if (!categoryId) {
              setError('카테고리를 찾을 수 없습니다.');
              return;
            }
            
            // 카테고리별 조회 (정렬 적용)
            if (sort === 'popular') {
              // 인기순 카테고리별 조회 - API가 지원한다면 fetchPopularPostsByCategory 사용
              // 현재는 일반 조회 후 정렬로 대체
              const categoryData = await fetchPostsByCategory(categoryId, page, PAGE_SIZE);
              if (categoryData.content) {
                categoryData.content.sort((a: PostDTO, b: PostDTO) => b.likeCount - a.likeCount);
              }
              data = categoryData;
            } else {
              data = await fetchPostsByCategory(categoryId, page, PAGE_SIZE);
            }
          } else {
            // 전체 조회
            data = await (sort === 'popular' ? fetchPopularPosts : fetchPosts)(page, PAGE_SIZE);
          }
        }
        
        // 빈 페이지 처리
        if (data.content?.length === 0 && page > 0 && data.totalPages > 0) {
          const newPage = Math.max(0, data.totalPages - 1);
          setSearchParams({
            category,
            sort,
            keyword,
            page: String(newPage)
          });
          return;
        }
        
        setPosts(data.content || []);
        setTotalPages(data.totalPages || 1);
        
      } catch (err) {
        console.error('게시글 로드 실패:', err);
        setError('게시글을 불러오지 못했습니다.');
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    // 카테고리 데이터가 로드된 후에만 게시글 로드
    if (categories.length > 0 || category === '전체') {
      loadPosts();
    }
  }, [category, sort, page, keyword, categories]);

  // 좋아요 상태 로드
  useEffect(() => {
    if (posts.length === 0) return;
    if (userId === undefined) return;
    
    const fetchLikedStates = async () => {
      try {
        const likedResults = await Promise.all(
          posts.map(post => checkPostLiked(userId, post.id))
        );
        
        const likeCountMap: { [postId: number]: number } = {};
        const likedStateMap: { [postId: number]: boolean } = {};
        
        posts.forEach((post, idx) => {
          likeCountMap[post.id] = post.likeCount;
          likedStateMap[post.id] = likedResults[idx];
        });
        
        setLikeCounts(likeCountMap);
        setLikedMap(likedStateMap);
      } catch (err) {
        console.error('좋아요 상태 로드 실패:', err);
      }
    };
    
    fetchLikedStates();
  }, [posts, userId]);

  // 페이지 변경 시 스크롤 최상단으로
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [page]);

  const handleCategoryChange = (newCategory: string) => {
    setSearchParams({
      category: newCategory,
      sort,
      keyword,
      page: '0'
    });
  };

  const handleSortChange = (newSort: 'latest' | 'popular') => {
    setSearchParams({
      category,
      sort: newSort,
      keyword,
      page: '0'
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      category,
      sort,
      keyword: searchInputValue.trim(),
      page: '0'
    });
  };

  const handleLikeClick = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    if (likeLoading[postId]) return;
    if (userId === undefined) return;
    if (typeof postId !== 'number') return;
    const currentlyLiked = likedMap[postId];
    
    setLikeLoading(prev => ({ ...prev, [postId]: true }));
    
    try {
      if (currentlyLiked) {
        await unlikePost(userId as number, postId as number);
        setLikedMap(prev => ({ ...prev, [postId]: false }));
        setLikeCounts(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 1) - 1) }));
      } else {
        await likePost(userId as number, postId as number);
        setLikedMap(prev => ({ ...prev, [postId]: true }));
        setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      }
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      // 에러 시 원래 상태로 복구하거나 사용자에게 알림
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const goToWrite = () => {
    navigate('/community/write', { state: { from: location.search } });
  };
  
  const goToDetail = (id: number) => {
    navigate(`/community/${id}`, { state: { from: location.search } });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8" style={{ paddingTop: 'var(--header-height, 90px)' }}>
        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">커뮤니티</h1>

        {/* 카테고리 탭 */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            <button
              key="all"
              onClick={() => handleCategoryChange('전체')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                category === '전체'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              전체
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.name)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  category === cat.name
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 정렬/검색/글쓰기 */}
        <div className="mb-4">
          {/* 데스크톱 레이아웃 */}
          <div className="hidden md:flex flex-row items-center gap-2 overflow-x-auto whitespace-nowrap">
            <button
              className={`px-3 py-1 rounded shrink-0 transition-colors ${
                sort === 'latest' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              onClick={() => handleSortChange('latest')}
            >
              최신순
            </button>
            <button
              className={`px-3 py-1 rounded shrink-0 transition-colors ${
                sort === 'popular' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              onClick={() => handleSortChange('popular')}
            >
              인기순
            </button>
            <form className="flex gap-2 flex-1 min-w-[120px]" onSubmit={handleSearch}>
              <Input
                className="w-full max-w-xs"
                value={searchInputValue}
                onChange={e => setSearchInputValue(e.target.value)}
                placeholder="제목/내용 검색"
                aria-label="검색어 입력"
              />
              <Button type="submit" className="shrink-0">검색</Button>
            </form>
            <Button className="ml-auto bg-blue-600 shrink-0" onClick={goToWrite}>
              글쓰기
            </Button>
          </div>

          {/* 모바일 레이아웃 */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    sort === 'latest' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSortChange('latest')}
                >
                  최신순
                </button>
                <button
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    sort === 'popular' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSortChange('popular')}
                >
                  인기순
                </button>
              </div>
              
              <Button 
                className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={goToWrite}
              >
                <span className="text-sm font-medium">글쓰기</span>
              </Button>
            </div>

            <form className="flex gap-2" onSubmit={handleSearch}>
              <Input
                className="flex-1 text-sm"
                value={searchInputValue}
                onChange={e => setSearchInputValue(e.target.value)}
                placeholder="제목/내용 검색"
                aria-label="검색어 입력"
              />
              <Button type="submit" className="px-4 py-2 text-sm">
                검색
              </Button>
            </form>
          </div>
        </div>

        {/* 에러 메시지 */}
        {categoryError && (
          <div className="text-red-500 text-sm mb-2 p-2 bg-red-50 rounded">
            {categoryError}
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm mb-2 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        {/* 게시글 목록 */}
        <div ref={listRef} className="mt-4 space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">로딩 중...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {keyword ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
            </div>
          ) : (
            posts.map(post => (
              <Card
                key={post.id}
                className="!p-6 min-h-[132px] flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
                style={{ minHeight: '132px' }}
                tabIndex={0}
                aria-label={`게시글: ${post.title}`}
                onClick={() => goToDetail(post.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goToDetail(post.id);
                  }
                }}
              >
                <div className="flex justify-between items-start h-full">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-blue-500">
                      {`[${post.categoryName}]`}
                    </span>
                    <h3 className="font-bold mt-1 truncate">{post.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                  {post.imageUrl && (
                    <div 
                      className="w-16 h-16 ml-2 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden"
                      style={{
                        width: '64px',
                        height: '64px',
                        minWidth: '64px',
                        minHeight: '64px'
                      }}
                    >
                      <img 
                        src={post.imageUrl}
                        alt="게시글 이미지"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/logo.png';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t">
                  <span>{post.userName}</span>
                  {post.userId !== userId ? (
                    <button
                      type="button"
                      className="flex items-center focus:outline-none hover:scale-110 transition-transform"
                      aria-pressed={likedMap[post.id]}
                      onClick={e => handleLikeClick(e, post.id)}
                      disabled={likeLoading[post.id]}
                      tabIndex={0}
                      aria-label={likedMap[post.id] ? '좋아요 취소' : '좋아요'}
                    >
                      <Heart 
                        className={`w-4 h-4 mr-1 transition-colors ${
                          likedMap[post.id] 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-red-500 hover:fill-red-100'
                        } ${likeLoading[post.id] ? 'animate-pulse' : ''}`} 
                      />
                      <span className="select-none">
                        {likeCounts[post.id] ?? post.likeCount}
                      </span>
                    </button>
                  ) : (
                    <span className="flex items-center">
                      <Heart 
                        className={`w-4 h-4 mr-1 ${
                          likedMap[post.id] ? 'fill-red-500 text-red-500' : 'text-red-500'
                        }`} 
                        aria-hidden="true"
                      />
                      <span className="select-none">
                        {likeCounts[post.id] ?? post.likeCount}
                      </span>
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={newPage => {
                setSearchParams({
                  category,
                  sort,
                  keyword,
                  page: String(newPage)
                });
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityPage;