import React from 'react';
import { HiHeart } from 'react-icons/hi';

interface CommunityHotPostsProps {
  categories: { key: string; icon: React.ReactNode }[];
  topPosts: { category: string; title: string; likes: number }[];
}

const CommunityHotPosts: React.FC<CommunityHotPostsProps> = ({ categories, topPosts }) => (
  <div className="flex flex-col gap-4">
    {categories.map(({ key, icon }) => {
      const top = topPosts.find((item) => item.category === key);
      return (
        <div key={key} className="flex items-center bg-gray-50 rounded-lg p-4 shadow hover:bg-gray-100 transition min-h-[64px] cursor-pointer">
          {icon}
          <span className="text-base font-bold text-blue-600 mr-2">[{key}]</span>
          {top ? (
            <>
              <span className="font-semibold text-base truncate max-w-[300px]">{top.title}</span>
              <span className="flex items-center gap-1 text-sm text-gray-500 ml-auto"><HiHeart className="w-4 h-4 text-red-500" />{top.likes}</span>
            </>
          ) : (
            <span className="text-gray-400 text-sm ml-2">인기글 없음</span>
          )}
        </div>
      );
    })}
  </div>
);

export default CommunityHotPosts; 