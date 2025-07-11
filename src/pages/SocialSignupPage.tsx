import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import { socialSignup } from '@/api/authApi';
import type { SocialSignupRequest } from '@/types/auth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SocialSignupPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState<SocialSignupRequest>({
        email: '',
        name: '',
        birthday: '',
        gender: 'MALE',
        provider: '',
        goal: '',
        weight: 0,
        height: 0,
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const email = params.get('email');
        const name = params.get('name');
        const provider = params.get('provider');
        
        if (email && name && provider) {
            setFormData(prev => ({ ...prev, email, name, provider }));
        } else {
            alert('잘못된 접근입니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        }
    }, [location, navigate]);

    /**
     * 일반 입력 필드(`Input`)의 값이 변경될 때 호출되는 핸들러입니다.
     * `formData` 상태를 업데이트합니다.
     * @param e - 변경 이벤트 객체
     */
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    /**
     * 성별(`Select`) 값이 변경될 때 호출되는 핸들러입니다.
     * `formData`의 `gender` 필드를 업데이트합니다.
     * @param value - 선택된 성별 값 ('MALE' 또는 'FEMALE')
     */
    const handleGenderChange = (value: string) => {
        setFormData(prev => ({ ...prev, gender: value }));
    };

    /**
     * 폼 제출 시 호출되는 비동기 핸들러입니다.
     * 추가 정보를 포함하여 소셜 회원가입을 완료합니다.
     * @param e - 폼 제출 이벤트 객체
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.birthday || !formData.gender) {
            return alert('생년월일과 성별은 필수 입력 항목입니다.');
        }
        
        try {
            const response = await socialSignup(formData);
            if (response.data.success) {
                 // 서버에서 받은 JWT 토큰을 로컬 스토리지에 저장 (자동 로그인 처리)
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


    return (
        <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-extrabold text-blue-600 mb-8">Synergym</h1>
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
