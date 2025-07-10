import React, { useEffect, useState, useRef } from 'react';
import { fetchPosts, fetchPopularPosts, fetchPostsByCategory, fetchCategories, searchPosts, checkPostLiked, likePost, unlikePost, fetchPostCounter } from '../services/api/communityApi';
import type { PostDTO, CategoryDTO } from '../types/community';
import Pagination from '../components/common/Pagination';
import { PostCard, CommunityFilters } from '../components/community';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import { useUserStore } from '@/store/userStore';
import { useRequireAuth } from "../hooks/useRequireAuth";

const PAGE_SIZE = 10;

const CommunityPage = () => {
  useRequireAuth("/community"); // 페이지 최상단에서 인증 체크

  // 커스텀 훅: 게시글 목록 관리
  const usePostsList = () => {
    const [posts, setPosts] = useState<PostDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    
    const loadPosts = async (
      category: string,
      sort: 'latest' | 'popular',
      page: number,
      keyword: string,
      categories: CategoryDTO[]
    ) => {
      setError(null);
      setLoading(true);

      try {
        let data;
        
        if (keyword.trim()) {
          data = await handleSearchPosts(category, sort, page, keyword, categories);
        } else {
          data = await handleNormalPosts(category, sort, page, categories);
        }
        
        // 빈 페이지 처리
        if (data.content?.length === 0 && page > 0 && data.totalPages > 0) {
          return { shouldRedirect: true, newPage: Math.max(0, data.totalPages - 1) };
        }
        
        setPosts(data.content || []);
        setTotalPages(data.totalPages || 1);
        return { shouldRedirect: false };
      } catch (err) {
        console.error('게시글 로드 실패:', err);
        setError('게시글을 불러오지 못했습니다.');
        setPosts([]);
        setTotalPages(1);
        return { shouldRedirect: false };
      } finally {
        setLoading(false);
      }
    };

    return { posts, loading, error, totalPages, loadPosts };
  };

  // 커스텀 훅: 좋아요 상태 관리
  const useLikeStates = (posts: PostDTO[], userId?: number) => {
    const [likedMap, setLikedMap] = useState<{ [postId: number]: boolean }>({});
    const [likeLoading, setLikeLoading] = useState<{ [postId: number]: boolean }>({});

    useEffect(() => {
      if (posts.length === 0 || userId === undefined) return;
      
      const fetchLikedStates = async () => {
        try {
          const likedResults = await Promise.all(
            posts.map(post => checkPostLiked(userId, post.id))
          );
          
          const likedStateMap: { [postId: number]: boolean } = {};
          posts.forEach((post, idx) => {
            likedStateMap[post.id] = likedResults[idx];
          });
          
          setLikedMap(likedStateMap);
        } catch (err) {
          console.error('좋아요 상태 로드 실패:', err);
        }
      };
      
      fetchLikedStates();
    }, [posts, userId]);

    const handleLikeClick = async (e: React.MouseEvent, postId: number) => {
      e.stopPropagation();
      if (likeLoading[postId] || userId === undefined) return;
      
      setLikeLoading(prev => ({ ...prev, [postId]: true }));
      
      try {
        const currentlyLiked = likedMap[postId];
        
        if (currentlyLiked) {
          await unlikePost(userId, postId);
          setLikedMap(prev => ({ ...prev, [postId]: false }));
        } else {
          await likePost(userId, postId);
          setLikedMap(prev => ({ ...prev, [postId]: true }));
        }
        
        // 서버에서 최신 카운터 정보 가져오기
        try {
          const counter = await fetchPostCounter(postId);
          // PostDTO의 카운터 정보는 자동으로 업데이트됨
        } catch (counterErr) {
          console.error('카운터 정보 가져오기 실패:', counterErr);
        }
      } catch (err) {
        console.error('좋아요 처리 실패:', err);
      } finally {
        setLikeLoading(prev => ({ ...prev, [postId]: false }));
      }
    };

    return { likedMap, likeLoading, handleLikeClick };
  };

  // 검색 게시글 처리 함수
  const handleSearchPosts = async (
    category: string,
    sort: 'latest' | 'popular',
    page: number,
    keyword: string,
    categories: CategoryDTO[]
  ) => {
    if (category !== '전체') {
      const categoryId = categories.find(cat => cat.name === category)?.id;
      if (!categoryId) throw new Error('카테고리를 찾을 수 없습니다.');
      
      const allCategoryPosts = await fetchPostsByCategory(categoryId, 0, 1000);
      const filteredPosts = allCategoryPosts.content?.filter((post: PostDTO) =>
        post.title.toLowerCase().includes(keyword.toLowerCase()) || 
        post.content.toLowerCase().includes(keyword.toLowerCase())
      ) || [];
      
      return sortAndPaginatePosts(filteredPosts, sort, page);
    } else {
      const searchResults = await searchPosts(keyword);
      return sortAndPaginatePosts(searchResults, sort, page);
    }
  };

  // 일반 게시글 처리 함수
  const handleNormalPosts = async (
    category: string,
    sort: 'latest' | 'popular',
    page: number,
    categories: CategoryDTO[]
  ) => {
    if (category !== '전체') {
      const categoryId = categories.find(cat => cat.name === category)?.id;
      if (!categoryId) throw new Error('카테고리를 찾을 수 없습니다.');
      
      const data = await fetchPostsByCategory(categoryId, page, PAGE_SIZE);
      if (sort === 'popular' && data.content) {
        data.content.sort((a: PostDTO, b: PostDTO) => b.likeCount - a.likeCount);
      }
      return data;
    } else {
      return await (sort === 'popular' ? fetchPopularPosts : fetchPosts)(page, PAGE_SIZE);
    }
  };

  // 정렬 및 페이지네이션 함수
  const sortAndPaginatePosts = (posts: PostDTO[], sort: 'latest' | 'popular', page: number) => {
    if (sort === 'popular') {
      posts.sort((a: PostDTO, b: PostDTO) => b.likeCount - a.likeCount);
    } else {
      posts.sort((a: PostDTO, b: PostDTO) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    const startIndex = page * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedPosts = posts.slice(startIndex, endIndex);
    const calculatedTotalPages = Math.ceil(posts.length / PAGE_SIZE);
    
    return {
      content: paginatedPosts,
      totalPages: calculatedTotalPages
    };
  };

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useUserStore();
  const userId = user?.id;
  const listRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // 커스텀 훅 사용
  const { posts, loading, error, totalPages, loadPosts } = usePostsList();
  const { likedMap, likeLoading, handleLikeClick } = useLikeStates(posts, userId);

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

  // 게시글 로드
  useEffect(() => {
    if (categories.length > 0 || category === '전체') {
      loadPosts(category, sort, page, keyword, categories).then(result => {
        if (result.shouldRedirect) {
          setSearchParams({
            category,
            sort,
            keyword,
            page: String(result.newPage)
          });
        }
      });
    }
  }, [category, sort, page, keyword, categories]);

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

  const goToWrite = () => {
    navigate('/community/write', { state: { from: location.search } });
  };
  
  const goToDetail = (id: number) => {
    navigate(`/community/${id}`, { state: { from: location.search } });
  };



  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8" style={{ paddingTop: 'var(--header-height, 90px)' }}>
        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">커뮤니티</h1>

        <CommunityFilters
          categories={categories}
          currentCategory={category}
          currentSort={sort}
          searchValue={searchInputValue}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onSearchChange={setSearchInputValue}
          onSearchSubmit={handleSearch}
          onWriteClick={goToWrite}
        />

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
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedMap[post.id]}
                likeLoading={likeLoading[post.id]}
                onLikeClick={e => handleLikeClick(e, post.id)}
                onClick={() => goToDetail(post.id)}
              />
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