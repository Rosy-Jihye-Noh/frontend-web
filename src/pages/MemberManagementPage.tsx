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
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50/50 border-b border-gray-200">
                    <CardTitle className="text-gray-800 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500/70" />
                        회원 목록
                    </CardTitle>
                    <CardDescription className="text-gray-600">회원을 검색하거나 관리할 수 있습니다.</CardDescription>
                    <div className="mt-4">
                        <Input
                            placeholder="이름 또는 이메일로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm border-gray-300 focus-visible:ring-blue-500/50"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-gray-50/80 border-b border-gray-200">
                            <TableRow>
                                <TableHead className="w-[20%] font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        회원
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        생일
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">성별</TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-gray-500" />
                                        목표
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-green-500" />
                                        가입날짜
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        최종수정일
                                    </div>
                                </TableHead>
                                <TableHead className="text-right font-semibold text-gray-700">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">회원 목록을 불러오는 중...</TableCell>
                                </TableRow>
                            )}
                            {error && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-red-500">{error}</TableCell>
                                </TableRow>
                            )}
                            {!loading && !error && filteredMembers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">표시할 회원이 없습니다.</TableCell>
                                </TableRow>
                            )}
                            {!loading && !error && filteredMembers.map((member) => (
                                <TableRow
                                    key={member.id}
                                    className="border-b border-gray-100"
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">{member.name}</div>
                                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Mail className="h-3 w-3 text-gray-400" />
                                                    {member.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-500/70" />
                                            {getBirthDate(member)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            member.gender === 'MALE' 
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                                : member.gender === 'FEMALE'
                                                ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                                        }`}>
                                            {member.gender === 'MALE' ? '남성' : member.gender === 'FEMALE' ? '여성' : '미설정'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-blue-500/70" />
                                            {getGoal(member)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-green-500/70" />
                                            {getJoinDate(member)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            {getLastModified(member)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                                            onClick={(e) => handleRemoveMember(e, member.id.toString())}
                                        >
                                            강제 탈퇴
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </MainLayout>
    );
};