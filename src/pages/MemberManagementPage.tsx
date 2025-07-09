import React, { useEffect, useState } from 'react';
import apiClient from '@/api/axiosInstance';
import { MainLayout } from '@/components/common/AdminLayout';
import { PageHeader } from '@/components/common/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Target, Clock, Users } from 'lucide-react';

type Member = {
  id: number; 
  name: string;
  email: string;
  lastModified?: string;
  lastModifiedDate?: string;
  updatedAt?: string;
  signedUp?: string;
  goal?: string;
  birthDate?: string;
  dateOfBirth?: string;
  birth?: string;
  gender: 'MALE' | 'FEMALE' | null;
  createdAt?: string;
  joinDate?: string;
  registeredAt?: string;
};

export const MemberManagementPage: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 날짜 포맷팅 헬퍼 함수
    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR');
        } catch {
            return dateString;
        }
    };

    // 생일 정보 가져오기 헬퍼 함수
    const getBirthDate = (member: Member): string => {
        return formatDate(member.birthDate || member.dateOfBirth || member.birth);
    };

    // 최종수정일 가져오기 헬퍼 함수
    const getLastModified = (member: Member): string => {
        return formatDate(member.lastModified || member.lastModifiedDate || member.updatedAt);
    };

    // 가입날짜 가져오기 헬퍼 함수
    const getJoinDate = (member: Member): string => {
        return formatDate(member.createdAt || member.joinDate || member.registeredAt || member.signedUp);
    };

    // 목표 정보 가져오기 헬퍼 함수
    const getGoal = (member: Member): string => {
        return member.goal || '설정안함';
    };

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError(null); // 에러 상태 초기화
                const response = await apiClient.get<Member[]>('admin/members');
                console.log('Members response:', response.data);
                setMembers(response.data);
            } catch (err) {
                console.error("API Error:", err); // 콘솔에 실제 에러 출력
                setError("회원 목록을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /**
   * 회원을 강제 탈퇴 처리하는 비동기 핸들러입니다.
   * @param e - 클릭 이벤트 객체 (이벤트 전파 방지를 위함)
   * @param memberId - 삭제할 회원의 ID (문자열 형태)
   */
    const handleRemoveMember = async (e: React.MouseEvent, memberId: string) => {
        // Dropdown 메뉴를 열었을 때, 뒤의 테이블 행이 클릭(페이지 이동)되는 것을 방지
        e.stopPropagation(); 
        
        // 사용자에게 삭제 여부를 다시 한번 확인
        if (!window.confirm("정말로 이 회원을 강제 탈퇴 처리하시겠습니까?")) return;
        
        const originalMembers = [...members];
        
        // 낙관적 업데이트: 서버 응답을 기다리지 않고 UI에서 먼저 해당 회원을 제거하여 빠른 사용자 경험 제공
        setMembers(prev => prev.filter(m => m.id !== Number(memberId)));

        try {
            // 실제 서버에 회원 삭제 API 요청
            await apiClient.delete(`/users/${memberId}`);
        } catch (error) {
            console.error("Failed to remove member:", error);
            alert("회원 삭제에 실패했습니다.");
            // 에러 발생 시, UI를 원래 상태로 되돌림 (롤백)
            setMembers(originalMembers);

        }
    };
    
    return (
        <MainLayout>
            <PageHeader title="회원 관리" />
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500/70" />
                        회원 목록
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">회원을 검색하거나 관리할 수 있습니다.</CardDescription>
                    <div className="mt-4">
                        <Input
                            placeholder="이름 또는 이메일로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:max-w-sm border-gray-300 dark:border-gray-600 focus-visible:ring-blue-500/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* 데스크탑 테이블 */}
                    <div className="hidden md:block">
                        <Table className="bg-white dark:bg-gray-800">
                            <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <TableRow>
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
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-700 dark:text-gray-200 py-8">회원 목록을 불러오는 중...</TableCell>
                                    </TableRow>
                                )}
                                {error && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-red-500 dark:text-red-400 py-8">{error}</TableCell>
                                    </TableRow>
                                )}
                                {!loading && !error && filteredMembers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-700 dark:text-gray-200 py-8">표시할 회원이 없습니다.</TableCell>
                                    </TableRow>
                                )}
                                {!loading && !error && filteredMembers.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
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
                                                onClick={(e) => handleRemoveMember(e, member.id.toString())}
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

                    {/* 모바일 카드 뷰 */}
                    <div className="md:hidden space-y-2">
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
                            <Card key={member.id} className="border-gray-200 h-50">
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
                                            <span className="font-medium truncate">{getBirthDate(member)}</span>
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
                                            <span className="font-medium truncate">{getGoal(member)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-green-500/70 flex-shrink-0" />
                                            <span className="text-gray-500 w-8 flex-shrink-0">가입:</span>
                                            <span className="font-medium truncate">{getJoinDate(member)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 col-span-2">
                                            <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-500 w-8 flex-shrink-0">수정:</span>
                                            <span className="font-medium truncate">{getLastModified(member)}</span>
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