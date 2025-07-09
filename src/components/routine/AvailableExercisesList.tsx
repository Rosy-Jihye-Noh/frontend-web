import React, { useState } from 'react';
import type { Exercise } from '@/types/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Heart } from 'lucide-react';

interface AvailableExercisesListProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  exercises: Exercise[];
  likedExercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
}

const TabButton = ({ 
  isActive, 
  onClick, 
  children, 
  icon 
}: { 
  isActive: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <button
    onClick={onClick} // 클릭 이벤트 핸들러
    // Tailwind CSS를 이용한 동적 스타일링: isActive 여부에 따라 배경색, 텍스트 색상, 그림자 등이 변경됩니다.
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    {children}
  </button>
);

const AvailableExercisesList: React.FC<AvailableExercisesListProps> = ({
  searchTerm, 
  onSearchTermChange, 
  exercises, 
  likedExercises,
  onAddExercise
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'liked'>('all');

  const currentExercises = activeTab === 'all' ? exercises : likedExercises;
  const filteredExercises = currentExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>운동 추가하기</CardTitle>
        
        {/* 탭 버튼들 */}
        <div className="flex gap-2 mt-4">
          <TabButton 
            isActive={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
          >
            모든 운동
          </TabButton>
          <TabButton 
            isActive={activeTab === 'liked'} 
            onClick={() => setActiveTab('liked')}
            icon={<Heart className="w-4 h-4" />}
          >
            내가 좋아요한 운동
          </TabButton>
        </div>
      </CardHeader>
      
      <CardContent>
        <Input
          placeholder={`${activeTab === 'all' ? '모든' : '좋아요한'} 운동 이름 검색`}
          value={searchTerm}
          onChange={e => onSearchTermChange(e.target.value)}
          className="mb-4"
        />
        
        <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
          {filteredExercises.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {activeTab === 'liked' ? (
                  <div>
                    <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-500" />
                    <p>좋아요한 운동이 없습니다.</p>
                    <p className="text-sm">운동 목록에서 좋아요를 표시해보세요!</p>
                  </div>
                ) : (
                  <p>검색 결과가 없습니다.</p>
                )}
              </div>
          ) : (
            filteredExercises.map(ex => (
              <div 
                key={ex.id} 
                className="flex items-center justify-between p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{ex.name}</p>
                    {activeTab === 'liked' && (
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ex.bodyPart}</p>
                  {ex.category && (
                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {ex.category}
                    </span>
                  )}
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onAddExercise(ex)}
                  className="ml-3 hover:bg-blue-50"
                >
                  <PlusCircle className="h-5 w-5 text-blue-500" />
                </Button>
              </div>
            ))
          )}
        </div>
        
        {activeTab === 'liked' && filteredExercises.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 좋아요한 운동들로 빠르게 루틴을 만들어보세요!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableExercisesList;