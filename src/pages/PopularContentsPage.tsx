import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/axiosInstance';
import { MainLayout } from '@/components/common/AdminLayout';
import { PageHeader } from '@/components/common/AdminHeader';
import Pagination from '@/components/common/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, PlusSquare, Eye, MessageSquare, ThumbsUp } from 'lucide-react';

// Define the types for popular content
type PopularContentData = {
  popularByLikes: { name: string; count: number }[];
  popularByRoutine: { name: string; count: number }[];
  popularByViews: { title: string; count: number; categoryName: string; postId: number }[];
  popularByComments: { title: string; count: number; categoryName: string; postId: number }[];
  popularByPostLikes: { title: string; count: number; categoryName: string; postId: number }[];
};

export const PopularContentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PopularContentData | null>(null);
  const [loading, setLoading] = useState(true);

  // State for pagination
  const [likesCurrentPage, setLikesCurrentPage] = useState(0);
  const [routineCurrentPage, setRoutineCurrentPage] = useState(0);
  const [viewsCurrentPage, setViewsCurrentPage] = useState(0);
  const [commentsCurrentPage, setCommentsCurrentPage] = useState(0);
  const [postLikesCurrentPage, setPostLikesCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Post click handler
  const handlePostClick = (postId: number) => {
    if (isNaN(postId) || postId <= 0) {
      console.error('Invalid post ID:', postId);
      return;
    }
    navigate(`/community/${postId}`);
  };

  useEffect(() => {
    const fetchPopularData = async () => {
      try {
        setLoading(true);
        // Assuming the endpoint returns the popular content data
        const response = await apiClient.get<PopularContentData>('/admin/dashboard');
        console.log('Received popular content data:', response.data);
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch popular content data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularData();
  }, []);

  if (loading || !data) {
    return (
      <MainLayout>
        <PageHeader title="인기 콘텐츠" />
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80" /><Skeleton className="h-80" />
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Skeleton className="h-80" /><Skeleton className="h-80" /><Skeleton className="h-80" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="인기 콘텐츠" />

      {/* Popular Workouts Section */}
      <div className="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>인기 운동 (좋아요 순)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.popularByLikes
              .slice(likesCurrentPage * itemsPerPage, (likesCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </CardContent>
          <div className="px-4 pb-4 pt-2">
            <Pagination
              currentPage={likesCurrentPage}
              totalPages={Math.ceil(data.popularByLikes.length / itemsPerPage)}
              onPageChange={setLikesCurrentPage}
            />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>인기 운동 (루틴 추가 순)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.popularByRoutine
              .slice(routineCurrentPage * itemsPerPage, (routineCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <PlusSquare className="h-4 w-4 text-green-500" />
                    <span className="font-semibold text-green-600">+{item.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </CardContent>
          <div className="px-4 pb-4 pt-2">
            <Pagination
              currentPage={routineCurrentPage}
              totalPages={Math.ceil(data.popularByRoutine.length / itemsPerPage)}
              onPageChange={setRoutineCurrentPage}
            />
          </div>
        </Card>
      </div>

      {/* Popular Posts Section */}
      <div className="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>인기 게시물 (좋아요 순)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.popularByPostLikes
              .slice(postLikesCurrentPage * itemsPerPage, (postLikesCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors" onClick={() => handlePostClick(item.postId)}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.categoryName}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <ThumbsUp className="h-4 w-4 text-red-400" />
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </CardContent>
          <div className="px-4 pb-4 pt-2">
            <Pagination
              currentPage={postLikesCurrentPage}
              totalPages={Math.ceil(data.popularByPostLikes.length / itemsPerPage)}
              onPageChange={setPostLikesCurrentPage}
            />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>인기 게시물 (댓글 순)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.popularByComments
              .slice(commentsCurrentPage * itemsPerPage, (commentsCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors" onClick={() => handlePostClick(item.postId)}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.categoryName}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <MessageSquare className="h-4 w-4 text-green-400" />
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </CardContent>
          <div className="px-4 pb-4 pt-2">
            <Pagination
              currentPage={commentsCurrentPage}
              totalPages={Math.ceil(data.popularByComments.length / itemsPerPage)}
              onPageChange={setCommentsCurrentPage}
            />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>인기 게시물 (조회수 순)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.popularByViews
              .slice(viewsCurrentPage * itemsPerPage, (viewsCurrentPage + 1) * itemsPerPage)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors" onClick={() => handlePostClick(item.postId)}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.categoryName}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </CardContent>
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