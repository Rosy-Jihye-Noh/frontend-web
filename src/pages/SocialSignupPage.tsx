import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import { socialSignup } from '@/api/authApi';
// [수정] SignupRequest 대신 SocialSignupRequest 타입을 임포트
import type { SocialSignupRequest } from '@/types/auth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SocialSignupPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // [수정] 상태 타입을 SocialSignupRequest로 변경하고 password 필드 제거
    const [formData, setFormData] = useState<SocialSignupRequest>({
        email: '',
        name: '',
        birthday: '',
        gender: 'MALE',
        goal: '',
        weight: 0,
        height: 0,
    });

    // ... useEffect 및 핸들러 함수들은 이전과 동일하게 유지 ...
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const email = params.get('email');
        const name = params.get('name');
        
        if (email && name) {
            setFormData(prev => ({ ...prev, email, name }));
        } else {
            alert('잘못된 접근입니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        }
    }, [location, navigate]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleGenderChange = (value: string) => {
        setFormData(prev => ({ ...prev, gender: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.birthday || !formData.gender) {
            return alert('생년월일과 성별은 필수 입력 항목입니다.');
        }
        
        try {
            const response = await socialSignup(formData);
            if (response.data.success) {
                localStorage.setItem('jwt_token', response.data.token);
                alert('회원가입 및 로그인이 완료되었습니다.');
                navigate('/');
            }
        } catch (error) {
            console.error('소셜 회원가입 실패:', error);
            const errMessage = (error as any).response?.data?.message || '회원가입에 실패했습니다. 이미 가입된 계정일 수 있습니다.';
            alert(errMessage);
        }
    };


    // ... JSX 렌더링 부분은 이전과 동일 ...
    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-extrabold text-blue-600 mb-8">SynergyM</h1>
            <Card className="w-full max-w-lg p-8">
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">소셜 회원가입</h2>
                <p className="text-center text-sm text-gray-500 mb-6">서비스 이용을 위해 추가 정보를 입력해주세요.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
                        <Input type="email" value={formData.email} disabled className="bg-gray-100 dark:bg-gray-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름 (닉네임)</label>
                        <Input type="text" value={formData.name} disabled className="bg-gray-100 dark:bg-gray-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="birthday">생년월일</label>
                        <Input type="date" id="birthday" value={formData.birthday} onChange={handleChange} className="bg-white dark:bg-transparent dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">성별</label>
                        <Select value={formData.gender} onValueChange={handleGenderChange}>
                            <SelectTrigger className="bg-white dark:bg-transparent dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="성별을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                <SelectItem value="MALE" className="cursor-pointer px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700">남성</SelectItem>
                                <SelectItem value="FEMALE" className="cursor-pointer px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700">여성</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md">
                        가입 완료하고 시작하기
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default SocialSignupPage;
