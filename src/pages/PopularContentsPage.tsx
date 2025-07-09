import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/axiosInstance';
import { MainLayout } from '@/components/common/AdminLayout'; // 관리자 페이지 메인 레이아웃 임포트
import { PageHeader } from '@/components/common/AdminHeader'; // 관리자 페이지 헤더 임포트
import Pagination from '@/components/common/Pagination'; // 사용자 정의 페이지네이션 컴포넌트 임포트
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, PlusSquare, Eye, MessageSquare, ThumbsUp } from 'lucide-react';

// 인기 콘텐츠 데이터의 타입을 정의합니다.
type PopularContentData = {
  popularByLikes: { name: string; count: number }[]; // 운동 좋아요 순 인기 운동 목록
  popularByRoutine: { name: string; count: number }[]; // 루틴 추가 순 인기 운동 목록
  popularByViews: { title: string; count: number; categoryName: string; postId: number }[]; // 게시글 조회수 순 인기 게시물 목록
  popularByComments: { title: string; count: number; categoryName: string; postId: number }[]; // 게시글 댓글 순 인기 게시물 목록
  popularByPostLikes: { title: string; count: number; categoryName: string; postId: number }[]; // 게시글 좋아요 순 인기 게시물 목록
};

// PopularContentsPage 함수형 컴포넌트 정의
export const PopularContentsPage: React.FC = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수
  const [data, setData] = useState<PopularContentData | null>(null); // 인기 콘텐츠 데이터를 저장하는 상태
  const [loading, setLoading] = useState(true); // 데이터 로딩 중인지 여부

  // 각 섹션별 페이지네이션을 위한 현재 페이지 상태
  const [likesCurrentPage, setLikesCurrentPage] = useState(0);
  const [routineCurrentPage, setRoutineCurrentPage] = useState(0);
  const [viewsCurrentPage, setViewsCurrentPage] = useState(0);
  const [commentsCurrentPage, setCommentsCurrentPage] = useState(0);
  const [postLikesCurrentPage, setPostLikesCurrentPage] = useState(0);
  const itemsPerPage = 5; // 각 페이지에 표시될 항목 수

  /**
   * 게시물 클릭 시 해당 게시물 상세 페이지로 이동하는 핸들러입니다.
   * @param postId - 클릭된 게시물의 ID
   */
  const handlePostClick = (postId: number) => {
    // 유효하지 않은 postId인 경우 오류 로깅 후 함수 종료
    if (isNaN(postId) || postId <= 0) {
      console.error('Invalid post ID:', postId);
      return;
    }
    navigate(`/community/${postId}`); // `/community/{postId}` 경로로 이동
  };

  // 컴포넌트 마운트 시 인기 콘텐츠 데이터를 불러오는 useEffect 훅
  useEffect(() => {
    const fetchPopularData = async () => {
      try {
        setLoading(true); // 로딩 상태 시작
        // 백엔드 API로부터 인기 콘텐츠 데이터를 가져옵니다. (엔드포인트가 '/admin/dashboard'로 가정)
        const response = await apiClient.get<PopularContentData>('/admin/dashboard');
        console.log('Received popular content data:', response.data); // 디버깅을 위해 응답 데이터 로깅
        setData(response.data); // 가져온 데이터로 상태 업데이트
      } catch (error) {
        console.error("Failed to fetch popular content data:", error); // 오류 발생 시 콘솔에 에러 로깅
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };
    fetchPopularData(); // 데이터 불러오기 함수 호출
  }, []); // 빈 의존성 배열: 컴포넌트 마운트 시 한 번만 실행

  // 데이터 로딩 중이거나 데이터가 없을 때 표시할 스켈레톤 UI
  if (loading || !data) {
    return (
      <MainLayout> {/* 관리자 페이지 메인 레이아웃 */}
        <PageHeader title="인기 콘텐츠" /> {/* 페이지 헤더 */}
        {/* 인기 운동 섹션의 스켈레톤 (2열) */}
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80" /> {/* 높이 80px의 스켈레톤 카드 */}
            <Skeleton className="h-80" />
        </div>
        {/* 인기 게시물 섹션의 스켈레톤 (3열) */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
        </div>
      </MainLayout>
    );
  }

  // 데이터 로딩이 완료되고 데이터가 존재할 때 실제 UI 렌더링
  return (
    <MainLayout> {/* 관리자 페이지 메인 레이아웃 */}
      <PageHeader title="인기 콘텐츠" /> {/* 페이지 헤더 */}

      {/* 인기 운동 섹션 */}
      <div className="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2"> {/* 1열 또는 2열 그리드 레이아웃 */}
        {/* 인기 운동 (좋아요 순) 카드 */}
        <Card>
          <CardHeader><CardTitle>인기 운동 (좋아요 순) ❤️</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {/* 현재 페이지에 해당하는 좋아요 순 운동 목록을 잘라내어 표시 */}
            {data.popularByLikes
              .slice(likesCurrentPage * itemsPerPage, (likesCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" /> {/* 하트 아이콘 */}
                    <span className="font-semibold">{item.count.toLocaleString()}</span> {/* 좋아요 수 (지역화된 숫자 포맷) */}
                  </div>
                </div>
              ))}
          </CardContent>
          {/* 페이지네이션 컴포넌트 */}
          <div className="px-4 pb-4 pt-2">
            <Pagination
              currentPage={likesCurrentPage} // 현재 페이지
              totalPages={Math.ceil(data.popularByLikes.length / itemsPerPage)} // 총 페이지 수 계산
              onPageChange={setLikesCurrentPage} // 페이지 변경 핸들러
            />
          </div>
        </Card>

        {/* 인기 운동 (루틴 추가 순) 카드 */}
        <Card>
          <CardHeader><CardTitle>인기 운동 (루틴 추가 순) ➕</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {/* 현재 페이지에 해당하는 루틴 추가 순 운동 목록을 잘라내어 표시 */}
            {data.popularByRoutine
              .slice(routineCurrentPage * itemsPerPage, (routineCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <PlusSquare className="h-4 w-4 text-green-500" /> {/* 플러스 사각형 아이콘 */}
                    <span className="font-semibold text-green-600">+{item.count.toLocaleString()}</span> {/* 루틴 추가 수 */}
                  </div>
                </div>
              ))}
          </CardContent>
          {/* 페이지네이션 컴포넌트 */}
          <div className="px-4 pb-4 pt-2">
            <Pagination
              currentPage={routineCurrentPage}
              totalPages={Math.ceil(data.popularByRoutine.length / itemsPerPage)}
              onPageChange={setRoutineCurrentPage}
            />
          </div>
        </Card>
      </div>

      {/* 인기 게시물 섹션 */}
      <div className="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-3"> {/* 1열 또는 3열 그리드 레이아웃 */}
        {/* 인기 게시물 (좋아요 순) 카드 */}
        <Card>
          <CardHeader><CardTitle>인기 게시물 (좋아요 순) 👍</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {/* 현재 페이지에 해당하는 게시글 좋아요 순 목록을 잘라내어 표시 */}
            {data.popularByPostLikes
              .slice(postLikesCurrentPage * itemsPerPage, (postLikesCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} 
                     className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors" 
                     onClick={() => handlePostClick(item.postId)}> {/* 클릭 시 게시글 상세 페이지로 이동 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div> {/* 게시글 제목 (길면 생략) */}
                    <div className="text-xs text-muted-foreground">{item.categoryName}</div> {/* 카테고리 이름 */}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <ThumbsUp className="h-4 w-4 text-red-400" /> {/* 엄지 척 아이콘 */}
                    <span className="font-semibold">{item.count.toLocaleString()}</span> {/* 좋아요 수 */}
                  </div>
                </div>
              ))}
          </CardContent>
          {/* 페이지네이션 컴포넌트 */}
          <div className="px-4 pb-4 pt-2">
            <Pagination
              currentPage={postLikesCurrentPage}
              totalPages={Math.ceil(data.popularByPostLikes.length / itemsPerPage)}
              onPageChange={setPostLikesCurrentPage}
            />
          </div>
        </Card>

        {/* 인기 게시물 (댓글 순) 카드 */}
        <Card>
          <CardHeader><CardTitle>인기 게시물 (댓글 순) 💬</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {/* 현재 페이지에 해당하는 게시글 댓글 순 목록을 잘라내어 표시 */}
            {data.popularByComments
              .slice(commentsCurrentPage * itemsPerPage, (commentsCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} 
                     className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors" 
                     onClick={() => handlePostClick(item.postId)}> {/* 클릭 시 게시글 상세 페이지로 이동 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.categoryName}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <MessageSquare className="h-4 w-4 text-green-400" /> {/* 메시지 사각형 아이콘 */}
                    <span className="font-semibold">{item.count.toLocaleString()}</span> {/* 댓글 수 */}
                  </div>
                </div>
              ))}
          </CardContent>
          {/* 페이지네이션 컴포넌트 */}
          <div className="px-4 pb-4 pt-2">
            <Pagination
              currentPage={commentsCurrentPage}
              totalPages={Math.ceil(data.popularByComments.length / itemsPerPage)}
              onPageChange={setCommentsCurrentPage}
            />
          </div>
        </Card>

        {/* 인기 게시물 (조회수 순) 카드 */}
        <Card>
          <CardHeader><CardTitle>인기 게시물 (조회수 순) 👀</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {/* 현재 페이지에 해당하는 게시글 조회수 순 목록을 잘라내어 표시 */}
            {data.popularByViews
              .slice(viewsCurrentPage * itemsPerPage, (viewsCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} 
                     className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors" 
                     onClick={() => handlePostClick(item.postId)}> {/* 클릭 시 게시글 상세 페이지로 이동 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.categoryName}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Eye className="h-4 w-4 text-blue-400" /> {/* 눈 아이콘 */}
                    <span className="font-semibold">{item.count.toLocaleString()}</span> {/* 조회수 */}
                  </div>
                </div>
              ))}
          </CardContent>
          {/* 페이지네이션 컴포넌트 */}
          <div className="px-4 pb-4 pt-2">
            <Pagination
              currentPage={viewsCurrentPage}
              totalPages={Math.ceil(data.popularByViews.length / itemsPerPage)}
              onPageChange={setViewsCurrentPage}
            />
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}