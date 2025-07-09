import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChangeEvent } from 'react';

// 인증 관련 API 함수 임포트
import { checkEmailExists, sendVerificationCode, verifyCode, signup } from '@/api/authApi';
import type { SignupRequest } from '@/types/auth'; // 회원가입 요청 데이터 타입 정의

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// SignupPage 함수형 컴포넌트 정의
const SignupPage = () => {
    const navigate = useNavigate(); // 페이지 이동 함수

    // 회원가입 폼 데이터 상태 초기화
    const [formData, setFormData] = useState<SignupRequest>({
        email: '',
        password: '',
        name: '',
        birthday: '',
        gender: 'MALE', // 기본 성별은 'MALE'
        goal: '',
        weight: 0,
        height: 0,
    });
    const [profileImage, setProfileImage] = useState<File | null>(null); // 프로필 이미지 파일 상태
    // UI 상태 관리: 회원가입 진행 단계를 추적
    // 'idle': 초기 상태
    // 'checking': 이메일 중복 확인 중
    // 'checked': 이메일 중복 확인 완료 (사용 가능)
    // 'sending': 인증번호 발송 중
    // 'sent': 인증번호 발송 완료
    // 'verifying': 인증번호 확인 중
    // 'verified': 이메일 인증 완료 (나머지 정보 입력 가능)
    const [uiState, setUiState] = useState<'idle' | 'checking' | 'checked' | 'sending' | 'sent' | 'verifying' | 'verified'>('idle');
    const [verificationCode, setVerificationCode] = useState(''); // 이메일 인증 코드 상태

    /**
     * 입력 필드(`Input`)의 값이 변경될 때 호출되는 일반적인 변경 핸들러입니다.
     * `formData` 상태를 업데이트합니다.
     * @param e - 변경 이벤트 객체
     */
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target; // 변경된 입력 필드의 ID와 값
        setFormData(prev => ({ ...prev, [id]: value })); // 이전 `formData`를 복사하고 해당 필드만 업데이트
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
     * 프로필 이미지 파일 입력 필드(`Input type="file"`)의 변경 핸들러입니다.
     * 선택된 이미지 파일을 `profileImage` 상태에 저장합니다.
     * @param e - 변경 이벤트 객체
     */
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) { // 파일이 선택되었고 첫 번째 파일이 존재하면
            setProfileImage(e.target.files[0]); // 해당 파일을 상태에 저장
        }
    };
    
    /**
     * 이메일 중복 확인 버튼 클릭 시 호출되는 비동기 핸들러입니다.
     * 입력된 이메일이 이미 사용 중인지 확인합니다.
     */
    const handleCheckEmail = async () => {
        if (!formData.email) return alert('이메일을 입력해주세요.'); // 이메일 입력 여부 검증
        setUiState('checking'); // UI 상태를 'checking'으로 변경 (확인 중...)
        try {
            // `checkEmailExists` API를 호출하여 이메일 중복 여부 확인
            const response = await checkEmailExists(formData.email);
            if (response.data.exists) { // 이메일이 이미 존재하면
                alert('이미 사용 중인 이메일입니다.');
                setUiState('idle'); // UI 상태를 초기 'idle'로 되돌림
            } else { // 이메일이 사용 가능하면
                alert('사용 가능한 이메일입니다. 인증번호를 발송해주세요.');
                setUiState('checked'); // UI 상태를 'checked'로 변경 (인증번호 발송 버튼 활성화)
            }
        } catch (error) {
            alert('이메일 확인 중 오류가 발생했습니다.'); // API 호출 실패 시
            setUiState('idle'); // UI 상태를 초기 'idle'로 되돌림
        }
    };

    /**
     * 인증번호 발송 버튼 클릭 시 호출되는 비동기 핸들러입니다.
     * 입력된 이메일로 인증 코드를 요청합니다.
     */
    const handleSendCode = async () => {
        setUiState('sending'); // UI 상태를 'sending'으로 변경 (발송 중...)
        try {
            // `sendVerificationCode` API를 호출하여 인증번호 발송 요청
            await sendVerificationCode(formData.email);
            alert('인증번호가 발송되었습니다. 이메일을 확인해주세요.');
            setUiState('sent'); // UI 상태를 'sent'로 변경 (인증번호 입력 필드 활성화)
        } catch (error) {
            alert('인증번호 발송에 실패했습니다.');
            setUiState('checked'); // UI 상태를 'checked'로 되돌림 (재발송 시도 가능)
        }
    };

    /**
     * 인증번호 확인 버튼 클릭 시 호출되는 비동기 핸들러입니다.
     * 입력된 인증 코드가 유효한지 검증합니다.
     */
    const handleVerifyCode = async () => {
        setUiState('verifying'); // UI 상태를 'verifying'으로 변경 (확인 중...)
        try {
            // `verifyCode` API를 호출하여 이메일과 인증 코드 검증
            const response = await verifyCode(formData.email, verificationCode);
            if (response.data.verified) { // 인증 성공 시
                alert('인증에 성공했습니다. 나머지 정보를 입력해주세요.');
                setUiState('verified'); // UI 상태를 'verified'로 변경 (나머지 회원 정보 입력 필드 활성화)
            } else { // 인증 실패 시
                alert('인증번호가 일치하지 않습니다.');
                setUiState('sent'); // UI 상태를 'sent'로 되돌림 (인증번호 재입력)
            }
        } catch (error) {
            alert('인증번호 검증에 실패했습니다.');
            setUiState('sent'); // UI 상태를 'sent'로 되돌림
        }
    };
    
    /**
     * 회원가입 폼 제출 시 호출되는 최종 핸들러입니다.
     * 모든 회원 정보를 취합하여 서버에 회원가입 요청을 보냅니다.
     * @param e - 폼 제출 이벤트 객체
     */
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지
        // 필수 필드 (비밀번호, 이름, 생년월일)가 모두 입력되었는지 최종 확인
        if (!formData.password || !formData.name || !formData.birthday) {
            return alert('모든 필수 정보를 입력해주세요.');
        }
        
        try {
            // `signup` API를 호출하여 회원가입 요청. 프로필 이미지가 있으면 함께 전송
            await signup(formData, profileImage || undefined); // `undefined`는 profileImage가 null일 경우 전송하지 않도록 함
            alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다. 🎉');
            navigate('/login'); // 회원가입 성공 후 로그인 페이지로 이동
        } catch (error) {
            console.error('회원가입 실패:', error); // 콘솔에 에러 로깅
            alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요. 😭'); // 사용자에게 실패 알림
        }
    };

    // 컴포넌트 렌더링
    return (
        <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4">
            {/* 앱 로고/제목 (클릭 시 홈으로 이동) */}
            <h1 className="text-3xl font-extrabold text-blue-600 mb-8">SynergyM</h1>
            <Card className="w-full max-w-lg p-8"> {/* 카드 컨테이너: 최대 너비, 패딩 */}
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                    회원가입
                </h2>
                <form onSubmit={handleSignup} className="space-y-4"> {/* 회원가입 폼 */}
                    {/* 이메일 입력 및 중복/인증 섹션 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">이메일</label>
                        <div className="flex gap-2">
                            <Input 
                                type="email" 
                                id="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                // 이메일 인증이 완료되면 이메일 필드 비활성화
                                disabled={uiState === 'verified'} 
                                placeholder="email@example.com" 
                                className="bg-white dark:bg-transparent dark:text-white" 
                            />
                            {/* UI 상태에 따라 중복 확인 또는 인증번호 발송 버튼 표시 */}
                            {uiState === 'idle' && <Button type="button" onClick={handleCheckEmail}>중복 확인</Button>}
                            {uiState === 'checked' && <Button type="button" onClick={handleSendCode}>인증번호 발송</Button>}
                        </div>
                    </div>

                    {/* 인증번호 입력 및 확인 섹션 (인증번호가 발송되었거나 확인 중일 때만 표시) */}
                    {(uiState === 'sent' || uiState === 'verifying') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="verificationCode">인증번호</label>
                            <div className="flex gap-2">
                                <Input 
                                    type="text" 
                                    id="verificationCode" 
                                    value={verificationCode} 
                                    onChange={(e) => setVerificationCode(e.target.value)} 
                                    placeholder="인증번호 6자리" 
                                    className="bg-white dark:bg-transparent dark:text-white" 
                                />
                                <Button 
                                    type="button" 
                                    onClick={handleVerifyCode} 
                                    // 인증 확인 중이면 버튼 비활성화
                                    disabled={uiState === 'verifying'} 
                                >
                                    {uiState === 'verifying' ? '확인 중...' : '인증 확인'} {/* 상태에 따라 텍스트 변경 */}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {/* 나머지 회원 정보 입력 필드 (이메일 인증이 완료되었을 때만 표시) */}
                    {uiState === 'verified' && (
                        <>
                            {/* 비밀번호 입력 필드 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">비밀번호</label>
                                <Input type="password" id="password" value={formData.password} onChange={handleChange} placeholder="8자 이상 입력해주세요" className="bg-white dark:bg-transparent dark:text-white" />
                            </div>
                            {/* 이름 (닉네임) 입력 필드 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">이름 (닉네임)</label>
                                <Input type="text" id="name" value={formData.name} onChange={handleChange} placeholder="사용자 이름을 입력하세요" className="bg-white dark:bg-transparent dark:text-white" />
                            </div>
                            {/* 생년월일 입력 필드 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="birthday">생년월일</label>
                                <Input type="date" id="birthday" value={formData.birthday} onChange={handleChange} className="bg-white dark:bg-transparent dark:text-white" />
                            </div>
                            {/* 성별 선택 필드 */}
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
                            {/* 프로필 이미지 선택 필드 (선택 사항) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="profileImage">프로필 이미지 (선택)</label>
                                <Input type="file" id="profileImage" onChange={handleImageChange} accept="image/*" className="bg-white dark:bg-transparent dark:text-white file:text-gray-500" />
                            </div>
                            
                            {/* 회원가입 완료 버튼 */}
                            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md">
                                회원가입 완료
                            </Button>
                        </>
                    )}
                </form>

                {/* 소셜 로그인 구분선 및 텍스트 */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground dark:bg-gray-800">
                            Or sign up with
                        </span>
                    </div>
                </div>
                {/* 소셜 로그인 버튼들 */}
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" asChild>
                        <a href="http://localhost:8081/oauth2/authorization/google">Google</a>
                    </Button>
                    <Button variant="outline" asChild>
                        <a href="http://localhost:8081/oauth2/authorization/naver">Naver</a>
                    </Button>
                    <Button variant="outline" asChild>
                        <a href="http://localhost:8081/oauth2/authorization/kakao">Kakao</a>
                    </Button>
                </div>

                {/* 이미 계정이 있을 경우 로그인 페이지로 이동 링크 */}
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