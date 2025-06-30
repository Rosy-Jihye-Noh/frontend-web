import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChangeEvent } from 'react';

import { checkEmailExists, sendVerificationCode, verifyCode, signup } from '@/api/authApi';
import type { SignupRequest } from '@/types/auth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const SignupPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<SignupRequest>({
        email: '',
        password: '',
        name: '',
        birthday: '',
        gender: 'MALE',
        goal: '',
        weight: 0,
        height: 0,
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [uiState, setUiState] = useState<'idle' | 'checking' | 'checked' | 'sending' | 'sent' | 'verifying' | 'verified'>('idle');
    const [verificationCode, setVerificationCode] = useState('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleGenderChange = (value: string) => {
        setFormData(prev => ({ ...prev, gender: value }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };
    
    const handleCheckEmail = async () => {
        if (!formData.email) return alert('이메일을 입력해주세요.');
        setUiState('checking');
        try {
            const response = await checkEmailExists(formData.email);
            if (response.data.exists) {
                alert('이미 사용 중인 이메일입니다.');
                setUiState('idle');
            } else {
                alert('사용 가능한 이메일입니다. 인증번호를 발송해주세요.');
                setUiState('checked');
            }
        } catch (error) {
            alert('이메일 확인 중 오류가 발생했습니다.');
            setUiState('idle');
        }
    };

    const handleSendCode = async () => {
        setUiState('sending');
        try {
            await sendVerificationCode(formData.email);
            alert('인증번호가 발송되었습니다. 이메일을 확인해주세요.');
            setUiState('sent');
        } catch (error) {
            alert('인증번호 발송에 실패했습니다.');
            setUiState('checked');
        }
    };

    const handleVerifyCode = async () => {
        setUiState('verifying');
        try {
            const response = await verifyCode(formData.email, verificationCode);
            if (response.data.verified) {
                alert('인증에 성공했습니다. 나머지 정보를 입력해주세요.');
                setUiState('verified');
            } else {
                alert('인증번호가 일치하지 않습니다.');
                setUiState('sent');
            }
        } catch (error) {
            alert('인증번호 검증에 실패했습니다.');
            setUiState('sent');
        }
    };
    
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.password || !formData.name || !formData.birthday) {
            return alert('모든 필수 정보를 입력해주세요.');
        }
        
        try {
            await signup(formData, profileImage || undefined);
            alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (error) {
            console.error('회원가입 실패:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-extrabold text-blue-600 mb-8">SynergyM</h1>
            <Card className="w-full max-w-lg p-8">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                    회원가입
                </h2>
                <form onSubmit={handleSignup} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">이메일</label>
                        <div className="flex gap-2">
                            <Input type="email" id="email" value={formData.email} onChange={handleChange} disabled={uiState === 'verified'} placeholder="email@example.com" className="bg-white dark:bg-transparent dark:text-white" />
                            {uiState === 'idle' && <Button type="button" onClick={handleCheckEmail}>중복 확인</Button>}
                            {uiState === 'checked' && <Button type="button" onClick={handleSendCode}>인증번호 발송</Button>}
                        </div>
                    </div>

                    {(uiState === 'sent' || uiState === 'verifying') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="verificationCode">인증번호</label>
                            <div className="flex gap-2">
                                <Input type="text" id="verificationCode" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="인증번호 6자리" className="bg-white dark:bg-transparent dark:text-white" />
                                <Button type="button" onClick={handleVerifyCode} disabled={uiState === 'verifying'}>
                                    {uiState === 'verifying' ? '확인 중...' : '인증 확인'}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {uiState === 'verified' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">비밀번호</label>
                                <Input type="password" id="password" value={formData.password} onChange={handleChange} placeholder="8자 이상 입력해주세요" className="bg-white dark:bg-transparent dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">이름 (닉네임)</label>
                                <Input type="text" id="name" value={formData.name} onChange={handleChange} placeholder="사용자 이름을 입력하세요" className="bg-white dark:bg-transparent dark:text-white" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="birthday">생년월일</label>
                                <Input type="date" id="birthday" value={formData.birthday} onChange={handleChange} className="bg-white dark:bg-transparent dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">성별</label>
                                <Select onValueChange={handleGenderChange} defaultValue={formData.gender}>
                                    <SelectTrigger className="bg-white dark:bg-transparent dark:text-white">
                                        <SelectValue placeholder="성별을 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">남성</SelectItem>
                                        <SelectItem value="FEMALE">여성</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="profileImage">프로필 이미지 (선택)</label>
                                <Input type="file" id="profileImage" onChange={handleImageChange} accept="image/*" className="bg-white dark:bg-transparent dark:text-white file:text-gray-500" />
                            </div>
                            
                            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md">
                                회원가입 완료
                            </Button>
                        </>
                    )}
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    이미 계정이 있으신가요?{" "}
                    <span onClick={() => navigate("/login")} className="font-semibold text-blue-600 hover:underline cursor-pointer">
                        로그인하기
                    </span>
                </p>
            </Card>
        </div>
    );
};

export default SignupPage;
