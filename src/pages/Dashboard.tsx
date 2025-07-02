import React, { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HiCamera, HiTrendingUp, HiHeart, HiStar, HiUser, HiChatAlt2, HiLightBulb, HiChartBar, HiCheckCircle, HiLightningBolt } from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import CommunityHotPosts from '@/components/dashboard/CommunityHotPosts';
import TodayWorkoutCard from '@/components/dashboard/TodayWorkoutCard';
import MainFeaturesCard from '@/components/dashboard/MainFeaturesCard';
import PostureScoreCard from '@/components/dashboard/PostureScoreCard';
import WeeklyReportCard from '@/components/dashboard/WeeklyReportCard';

// 타입 정의
import type { User, Routine } from '../types/index';

// 더미 데이터
const DUMMY_USER: User = {
  id: 1,
  name: '홍길동',
  goal: '체지방 감량',
  profileImageUrl: '',
};

const DUMMY_ROUTINES: Routine[] = [
  {
    id: 1,
    name: '상체 루틴',
    description: '상체 근력 강화 루틴',
    exercises: [],
  },
  {
    id: 2,
    name: '하체 루틴',
    description: '하체 근력 강화 루틴',
    exercises: [],
  },
];

const DUMMY_REVIEWS = [
  { id: 1, text: '정말 효과가 좋아요!', author: 'user1', likes: 12, category: '후기' },
  { id: 2, text: '운동 루틴 추천 감사합니다.', author: 'user2', likes: 8, category: '후기' },
  { id: 3, text: '자세 분석이 신기해요.', author: 'user3', likes: 15, category: 'Q&A' },
  { id: 4, text: '질문이 있어요.', author: 'user4', likes: 5, category: 'Q&A' },
];

// 커뮤니티 카테고리 목록 (react-icons로 대체)
const COMMUNITY_CATEGORIES = [
  { key: '오운완', icon: <HiCheckCircle className="w-6 h-6 text-blue-500 mr-2" /> },
  { key: '자세인증', icon: <HiCamera className="w-6 h-6 text-purple-500 mr-2" /> },
  { key: 'Q&A', icon: <HiChatAlt2 className="w-6 h-6 text-green-500 mr-2" /> },
  { key: '사용자 후기', icon: <HiUser className="w-6 h-6 text-yellow-500 mr-2" /> },
  { key: '꿀팁', icon: <HiLightBulb className="w-6 h-6 text-orange-400 mr-2" /> },
];

// 예시 더미 데이터 (실제론 백엔드에서 카테고리별 인기글을 받아옴)
const DUMMY_COMMUNITY_TOP = [
  { category: '오운완', title: '오늘 운동 완료 인증합니다!', likes: 23 },
  { category: '자세인증', title: '스쿼트 자세 이렇게 하면 되나요?', likes: 17 },
  { category: 'Q&A', title: '운동 루틴 추천 부탁드려요', likes: 12 },
  { category: '사용자 후기', title: '정말 효과가 좋아요!', likes: 30 },
  { category: '꿀팁', title: '운동 전 스트레칭 꿀팁 공유', likes: 15 },
];

const Dashboard: React.FC = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('전체');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8" style={{ paddingTop: '72px' }}>
        {/* 오늘의 운동 + 주요 기능 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TodayWorkoutCard
            routineName={DUMMY_ROUTINES[0].name}
            onStart={() => alert('운동 기록 시작!')}
          />
          <MainFeaturesCard
            onPostureAnalysis={() => alert('자세 분석 이동')}
            onWorkoutRecommend={() => alert('운동 추천 이동')}
          />
        </div>
        {/* 자세 변화 그래프 + 주간 운동 리포트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PostureScoreCard />
          <WeeklyReportCard />
        </div>

        {/* 커뮤니티 인기글 (카테고리별) */}
        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-center">커뮤니티 인기글</h2>
          <CommunityHotPosts categories={COMMUNITY_CATEGORIES} topPosts={DUMMY_COMMUNITY_TOP} />
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
