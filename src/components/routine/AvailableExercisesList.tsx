import React, { useState } from 'react';
import type { Exercise } from '@/types/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Heart } from 'lucide-react';

// AvailableExercisesList 컴포넌트의 props 인터페이스
interface AvailableExercisesListProps {
  searchTerm: string; // 운동 검색어 상태
  onSearchTermChange: (term: string) => void; // 검색어 변경 시 호출될 함수
  exercises: Exercise[]; // 모든 사용 가능한 운동 목록
  likedExercises: Exercise[]; // 사용자가 '좋아요'한 운동 목록
  onAddExercise: (exercise: Exercise) => void; // 운동을 루틴에 추가할 때 호출될 함수
}

// 탭 버튼을 위한 개별 컴포넌트
const TabButton = ({ 
  isActive,     // 현재 탭이 활성화 상태인지 여부 (boolean)
  onClick,      // 버튼 클릭 시 호출될 함수
  children,     // 버튼 내부에 렌더링될 내용 (React 노드)
  icon          // 버튼 왼쪽에 표시될 아이콘 (선택 사항, React 노드)
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
        ? 'bg-blue-600 text-white shadow-md' // 활성화된 탭 스타일
        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' // 비활성화된 탭 스타일
    }`}
  >
    {icon}       {/* 아이콘이 있다면 렌더링 */}
    {children}   {/* 자식 요소 (탭 이름 텍스트) 렌더링 */}
  </button>
);

// AvailableExercisesList 함수형 컴포넌트 정의
const AvailableExercisesList: React.FC<AvailableExercisesListProps> = ({
  searchTerm,           // 검색어
  onSearchTermChange,   // 검색어 변경 핸들러
  exercises,            // 모든 운동 목록
  likedExercises,       // 좋아요한 운동 목록
  onAddExercise         // 운동 추가 핸들러
}) => {
  // 현재 활성화된 탭의 상태를 관리합니다 ('all' 또는 'liked'). 기본값은 'all'입니다.
  const [activeTab, setActiveTab] = useState<'all' | 'liked'>('all');

  // 활성화된 탭에 따라 표시할 운동 목록을 결정합니다.
  const currentExercises = activeTab === 'all' ? exercises : likedExercises;
  
  // 현재 탭의 운동 목록에서 검색어에 따라 운동을 필터링합니다.
  // 운동 이름이 검색어를 포함하는지 (대소문자 구분 없이) 확인합니다.
  const filteredExercises = currentExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card> {/* 전체 컴포넌트를 감싸는 카드 컴포넌트 */}
      <CardHeader> {/* 카드의 헤더 부분 */}
        <CardTitle>운동 추가하기</CardTitle> {/* 카드의 제목 */}
        
        {/* 탭 버튼들을 포함하는 컨테이너 */}
        <div className="flex gap-2 mt-4">
          <TabButton 
            isActive={activeTab === 'all'} // '모든 운동' 탭이 활성 상태인지
            onClick={() => setActiveTab('all')} // 클릭 시 활성 탭을 'all'로 설정
          >
            모든 운동
          </TabButton>
          <TabButton 
            isActive={activeTab === 'liked'} // '내가 좋아요한 운동' 탭이 활성 상태인지
            onClick={() => setActiveTab('liked')} // 클릭 시 활성 탭을 'liked'로 설정
            icon={<Heart className="w-4 h-4" />} // 하트 아이콘
          >
            내가 좋아요한 운동
          </TabButton>
        </div>
      </CardHeader>
      
      <CardContent> {/* 카드의 내용 부분 */}
        {/* 운동 검색 입력 필드 */}
        <Input
          // 현재 활성 탭에 따라 플레이스홀더 텍스트를 동적으로 변경합니다.
          placeholder={`${activeTab === 'all' ? '모든' : '좋아요한'} 운동 이름 검색`}
          value={searchTerm} // 검색어 상태와 연결
          onChange={e => onSearchTermChange(e.target.value)} // 입력 값 변경 시 핸들러 호출
          className="mb-4" // 하단 여백
        />
        
        {/* 운동 목록을 표시하는 스크롤 가능한 영역 */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-2"> {/* 최대 높이, 세로 스크롤, 항목 간 간격 */}
          {filteredExercises.length === 0 ? ( // 필터링된 운동이 없을 경우
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {activeTab === 'liked' ? ( // '좋아요한 운동' 탭이고 운동이 없을 경우
                <div>
                  <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-500" /> {/* 큰 하트 아이콘 */}
                  <p>좋아요한 운동이 없습니다.</p>
                  <p className="text-sm">운동 목록에서 좋아요를 표시해보세요!</p>
                </div>
              ) : ( // '모든 운동' 탭이거나 다른 탭에서 검색 결과가 없을 경우
                <p>검색 결과가 없습니다.</p>
              )}
            </div>
          ) : ( // 필터링된 운동이 있을 경우
            // 각 운동을 순회하며 목록 항목을 렌더링
            filteredExercises.map(ex => (
              <div 
                key={ex.id} // 운동 고유 ID를 키로 사용
                className="flex items-center justify-between p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
              >
                <div className="flex-1"> {/* 운동 정보 영역 */}
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{ex.name}</p> {/* 운동 이름 */}
                    {activeTab === 'liked' && ( // '좋아요한 운동' 탭일 경우 하트 아이콘 표시
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ex.bodyPart}</p> {/* 운동 부위 */}
                  {ex.category && ( // 운동 카테고리가 있다면 뱃지로 표시
                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {ex.category}
                    </span>
                  )}
                </div>
                {/* 운동 추가 버튼 */}
                <Button 
                  size="icon" // 아이콘 크기 버튼
                  variant="ghost" // 투명 버튼 스타일
                  onClick={() => onAddExercise(ex)} // 클릭 시 해당 운동을 루틴에 추가하는 핸들러 호출
                  className="ml-3 hover:bg-blue-50"
                >
                  <PlusCircle className="h-5 w-5 text-blue-500" /> {/* 플러스 아이콘 */}
                </Button>
              </div>
            ))
          )}
        </div>
        
        {/* '좋아요한 운동' 탭에서 운동이 있을 경우 팁 메시지 표시 */}
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

export default AvailableExercisesList; // 컴포넌트 내보내기