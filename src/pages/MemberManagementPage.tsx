import React, { useEffect, useState } from 'react';
import apiClient from '@/api/axiosInstance';
// 관리자 페이지 레이아웃 및 헤더 컴포넌트 임포트
import { MainLayout } from '@/components/common/AdminLayout';
import { PageHeader } from '@/components/common/AdminHeader';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';

import { User, Mail, Calendar, Target, Clock, Users } from 'lucide-react';

// 회원 데이터 타입
type Member = {
  id: number; // 회원의 고유 ID
  name: string; // 회원 이름
  email: string; // 회원 이메일
 
  lastModified?: string; // 최종 수정일 (옵셔널)
  lastModifiedDate?: string;
  updatedAt?: string;
  signedUp?: string; // 가입일 (옵셔널)
  goal?: string; // 운동 목표 (옵셔널)
  birthDate?: string; // 생년월일 (옵셔널)
  dateOfBirth?: string;
  birth?: string;
  gender: 'MALE' | 'FEMALE' | null; // 성별 (남성, 여성, 또는 null)
  createdAt?: string; // 생성일 (가입일과 유사)
  joinDate?: string;
  registeredAt?: string;
};

// MemberManagementPage 함수형 컴포넌트
export const MemberManagementPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]); // 모든 회원 목록
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const [loading, setLoading] = useState<boolean>(true); // 데이터 로딩 중인지 여부
  const [error, setError] = useState<string | null>(null); // 에러 메시지 (로딩 실패 시)

  /**
   * 날짜 문자열을 로컬(한국) 형식으로 포맷팅하는 헬퍼 함수입니다.
   * 유효하지 않은 날짜 문자열에 대한 예외 처리를 포함합니다.
   * @param dateString - 포맷팅할 날짜 문자열 또는 undefined
   * @returns {string} 포맷팅된 날짜 문자열 (예: "2023. 7. 9.") 또는 '-'
   */
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-'; // 날짜 문자열이 없으면 '-' 반환
    try {
      const date = new Date(dateString); // Date 객체로 변환
      return date.toLocaleDateString('ko-KR'); // 한국 로케일로 포맷팅
    } catch {
      return dateString; // 변환 실패 시 원본 문자열 반환
    }
  };

  /**
   * Member 객체에서 생년월일 정보를 다양한 필드명으로 찾아 포맷팅하여 반환합니다.
   * @param member - 회원 객체
   * @returns {string} 포맷팅된 생년월일 문자열
   */
  const getBirthDate = (member: Member): string => {
    return formatDate(member.birthDate || member.dateOfBirth || member.birth);
  };

  /**
   * Member 객체에서 최종 수정일 정보를 다양한 필드명으로 찾아 포맷팅하여 반환합니다.
   * @param member - 회원 객체
   * @returns {string} 포맷팅된 최종 수정일 문자열
   */
  const getLastModified = (member: Member): string => {
    return formatDate(member.lastModified || member.lastModifiedDate || member.updatedAt);
  };

  /**
   * Member 객체에서 가입 날짜 정보를 다양한 필드명으로 찾아 포맷팅하여 반환합니다.
   * @param member - 회원 객체
   * @returns {string} 포맷팅된 가입 날짜 문자열
   */
  const getJoinDate = (member: Member): string => {
    return formatDate(member.createdAt || member.joinDate || member.registeredAt || member.signedUp);
  };

  /**
   * Member 객체에서 목표 정보를 가져옵니다. 목표가 없으면 '설정안함'을 반환합니다.
   * @param member - 회원 객체
   * @returns {string} 회원의 목표 또는 '설정안함'
   */
  const getGoal = (member: Member): string => {
    return member.goal || '설정안함';
  };

  // 컴포넌트 마운트 시 회원 목록을 불러오는 useEffect 훅
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true); // 로딩 상태 시작
        setError(null);   // 이전 에러 상태 초기화
        // 백엔드 API로부터 회원 목록을 가져옵니다.
        const response = await apiClient.get<Member[]>('admin/members');
        console.log('Members response:', response.data); // 디버깅을 위해 API 응답 로깅
        setMembers(response.data); // 가져온 회원 목록으로 상태 업데이트
      } catch (err) {
        console.error("API Error:", err); // 콘솔에 실제 API 호출 에러 출력
        setError("회원 목록을 불러오는 데 실패했습니다."); // 사용자에게 표시할 에러 메시지 설정
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };
    fetchMembers(); // 회원 목록 불러오기 함수 호출
  }, []); // 빈 의존성 배열: 컴포넌트가 마운트될 때 한 번만 실행

  // 검색어에 따라 회원 목록을 필터링하는 기능
  const filteredMembers = members.filter(member =>
    // 회원의 이름 또는 이메일이 검색어를 포함하는지 (대소문자 구분 없이) 확인
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * 회원을 강제 탈퇴 처리하는 비동기 핸들러입니다.
   * @param e - 클릭 이벤트 객체 (이벤트 전파 방지를 위함)
   * @param memberId - 삭제할 회원의 ID (문자열 형태)
   */
  const handleRemoveMember = async (e: React.MouseEvent, memberId: string) => {
    // 이벤트 전파 중단: 드롭다운 메뉴를 열었을 때 테이블 행 클릭 이벤트가 발생하지 않도록 방지
    e.stopPropagation(); 
    
    // 사용자에게 삭제 여부를 최종적으로 확인하는 메시지
    if (!window.confirm("정말로 이 회원을 강제 탈퇴 처리하시겠습니까?")) return; // 사용자가 '취소'를 누르면 함수 종료
    
    const originalMembers = [...members]; // API 요청 실패 시 롤백을 위해 현재 회원 목록 복사
    
    // 낙관적 업데이트: 서버 응답을 기다리지 않고 UI에서 먼저 해당 회원을 제거하여 빠른 사용자 경험 제공
    setMembers(prev => prev.filter(m => m.id !== Number(memberId))); // ID가 일치하는 회원을 목록에서 제거

    try {
      // 실제 서버에 회원 삭제 API 요청 (DELETE 요청)
      await apiClient.delete(`/users/${memberId}`);
    } catch (error) {
      console.error("Failed to remove member:", error); // API 요청 실패 시 콘솔에 에러 로깅
      alert("회원 삭제에 실패했습니다."); // 사용자에게 실패 알림
      setMembers(originalMembers); // 에러 발생 시, UI를 원래 상태로 되돌림 (롤백)
    }
  };
  
  // 컴포넌트 렌더링 부분
  return (
    <MainLayout> {/* 관리자 페이지의 메인 레이아웃 컴포넌트 */}
      <PageHeader title="회원 관리" /> {/* 페이지 헤더 컴포넌트 */}
      {/* 회원 관리 카드: 테두리, 그림자, 배경색 설정 */}
      <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"> {/* 카드 헤더 스타일링 */}
          <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500/70" /> {/* 회원 아이콘 */}
            회원 목록 📋
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">회원을 검색하거나 관리할 수 있습니다.</CardDescription>
          <div className="mt-4">
            <Input
              placeholder="이름 또는 이메일로 검색..." // 검색 입력 필드 플레이스홀더
              value={searchTerm} // 검색어 상태와 연결
              onChange={(e) => setSearchTerm(e.target.value)} // 입력 값 변경 시 검색어 상태 업데이트
              className="w-full md:max-w-sm border-gray-300 dark:border-gray-600 focus-visible:ring-blue-500/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" // 입력 필드 스타일
            />
          </div>
        </CardHeader>
        <CardContent className="p-0"> {/* 카드 내용 부분 (패딩 0) */}
          {/* 데스크탑 버전 테이블 (md 이상 화면에서 표시) */}
          <div className="hidden md:block">
            <Table className="bg-white dark:bg-gray-800">
              <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TableRow>
                  {/* 테이블 헤더 셀들 */}
                  <TableHead className="w-[20%] font-semibold text-gray-700 dark:text-gray-200 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                      회원
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      생일
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-center">성별</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <Target className="h-4 w-4 text-gray-500" />
                      목표
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <Calendar className="h-4 w-4 text-green-500" />
                      가입날짜
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <Clock className="h-4 w-4 text-gray-500" />
                      최종수정일
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-200">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 로딩 중 메시지 */}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-700 dark:text-gray-200 py-8">회원 목록을 불러오는 중...</TableCell>
                  </TableRow>
                )}
                {/* 에러 메시지 */}
                {error && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-500 dark:text-red-400 py-8">{error}</TableCell>
                  </TableRow>
                )}
                {/* 데이터가 없고 로딩/에러도 아닐 때 메시지 */}
                {!loading && !error && filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-700 dark:text-gray-200 py-8">표시할 회원이 없습니다.</TableCell>
                  </TableRow>
                )}
                {/* 필터링된 회원 목록 매핑 */}
                {!loading && !error && filteredMembers.map((member) => (
                  <TableRow
                    key={member.id} // 고유 키
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" // 행 스타일
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* 회원 아이콘 및 이름/이메일 */}
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-100">{member.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 justify-center">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300 text-center">{getBirthDate(member)}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300 text-center">{member.gender === 'MALE' ? '남성' : member.gender === 'FEMALE' ? '여성' : '-'}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300 text-center">{getGoal(member)}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300 text-center">{getJoinDate(member)}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300 text-center">{getLastModified(member)}</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => handleRemoveMember(e, member.id.toString())} // 회원 삭제 버튼
                        className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-400 transition-all"
                      >
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 모바일 버전 카드 뷰 (md 미만 화면에서 표시) */}
          <div className="md:hidden space-y-2 p-4"> {/* 카드 목록 컨테이너 */}
            {loading && (
              <div className="text-center py-8">회원 목록을 불러오는 중...</div>
            )}
            {error && (
              <div className="text-center py-8 text-red-500">{error}</div>
            )}
            {!loading && !error && filteredMembers.length === 0 && (
              <div className="text-center py-8">표시할 회원이 없습니다.</div>
            )}
            {!loading && !error && filteredMembers.map((member) => (
              <Card key={member.id} className="border-gray-200 h-fit dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <CardContent className="p-2.5 h-full flex flex-col">
                  {/* 헤더: 이름, 이메일, 강제탈퇴 버튼 */}
                  <div className="flex items-start justify-between mb-1.5 flex-shrink-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-800 dark:text-gray-100 text-xs truncate">{member.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-200 truncate">{member.email}</div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors flex-shrink-0 ml-1"
                      onClick={(e) => handleRemoveMember(e, member.id.toString())}
                    >
                      탈퇴
                    </Button>
                  </div>
                  
                  {/* 기본 정보: 2열 그리드로 배치 */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs flex-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-500/70 flex-shrink-0" />
                      <span className="text-gray-500 w-8 flex-shrink-0">생일:</span>
                      <span className="font-medium truncate text-gray-700 dark:text-gray-200">{getBirthDate(member)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 w-8 flex-shrink-0">성별:</span>
                      <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium ${
                          member.gender === 'MALE' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : member.gender === 'FEMALE'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        {member.gender === 'MALE' ? '남성' : member.gender === 'FEMALE' ? '여성' : '미설정'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-blue-500/70 flex-shrink-0" />
                      <span className="text-gray-500 w-8 flex-shrink-0">목표:</span>
                      <span className="font-medium truncate text-gray-700 dark:text-gray-200">{getGoal(member)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-green-500/70 flex-shrink-0" />
                      <span className="text-gray-500 w-8 flex-shrink-0">가입:</span>
                      <span className="font-medium truncate text-gray-700 dark:text-gray-200">{getJoinDate(member)}</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2"> {/* 최종수정일은 2칸 차지 */}
                      <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-500 w-8 flex-shrink-0">수정:</span>
                      <span className="font-medium truncate text-gray-700 dark:text-gray-200">{getLastModified(member)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};