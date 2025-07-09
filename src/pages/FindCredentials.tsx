import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; 
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// 인증 관련 API 함수 임포트
import { findEmail, sendVerificationCode, verifyCode, changePassword } from '@/api/authApi';
// 인증 관련 타입 정의 임포트
import type { FindEmailRequest, ChangePasswordRequest } from '@/types/auth';

// FindCredentials 함수형 컴포넌트
const FindCredentials = () => {
    const navigate = useNavigate(); // 페이지 이동 함수
    const location = useLocation(); // 현재 라우트의 location 객체 (쿼리 파라미터나 state 등을 포함)
    // `initialTab`을 location.state에서 가져오거나, 없으면 'find-email'을 기본값으로 설정
    const initialTab = location.state?.initialTab || 'find-email';
    const [activeTab, setActiveTab] = useState(initialTab); // 현재 활성화된 탭 상태 ('find-email' 또는 'find-password')

    // --- 아이디 찾기 관련 상태 ---
    // 아이디 찾기 폼 데이터 (이름, 생년월일)
    const [findEmailForm, setFindEmailForm] = useState<FindEmailRequest>({ name: '', birthday: '' });
    const [foundEmail, setFoundEmail] = useState<string | null>(null); // 찾은 이메일

    // --- 비밀번호 찾기 및 재설정 관련 상태 ---
    const [resetEmail, setResetEmail] = useState(''); // 비밀번호 재설정 대상 이메일
    const [verificationCode, setVerificationCode] = useState(''); // 이메일 인증 코드
    const [newPassword, setNewPassword] = useState(''); // 새로 설정할 비밀번호
    // 비밀번호 재설정 UI의 현재 단계 (idle: 초기, code-sent: 인증번호 발송됨, verifying: 인증번호 확인 중, verified: 인증 완료)
    const [uiState, setUiState] = useState<'idle' | 'code-sent' | 'verifying' | 'verified'>('idle');

    /**
     * 아이디 찾기 폼 제출 핸들러입니다.
     * 입력된 이름과 생년월일로 이메일을 찾습니다.
     * @param e - 폼 제출 이벤트 객체
     */
    const handleFindEmail = async (e: React.FormEvent) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지
        setFoundEmail(null); // 이전에 찾았던 이메일 초기화
        try {
            // `findEmail` API를 호출하여 이메일 찾기 시도
            const response = await findEmail(findEmailForm);
            const email = response.data; // API 응답에서 이메일 데이터 가져오기
            
            // 찾은 이메일의 사용자 부분(골뱅이 앞)을 마스킹 처리하여 개인 정보 보호
            const parts = email.split('@'); // 이메일을 '@' 기준으로 분리
            // 사용자 이름이 2자보다 길면 앞 2자만 남기고 나머지는 '*'로 마스킹
            const maskedUser = parts[0].length > 2 ? parts[0].substring(0, 2) + '*'.repeat(parts[0].length - 2) : parts[0];
            setFoundEmail(`${maskedUser}@${parts[1]}`); // 마스킹된 이메일로 상태 업데이트
        } catch (error) {
            // 일치하는 사용자 정보가 없을 경우 알림
            alert('일치하는 사용자 정보가 없습니다.');
        }
    };

    /**
     * 비밀번호 재설정을 위한 인증번호 발송 핸들러입니다.
     * 입력된 이메일로 인증 코드를 요청합니다.
     */
    const handleSendCodeForReset = async () => {
        if (!resetEmail) return alert('이메일을 입력해주세요.'); // 이메일 입력 여부 확인
        try {
            // `sendVerificationCode` API를 호출하여 인증번호 발송 요청
            await sendVerificationCode(resetEmail);
            alert('인증번호가 발송되었습니다. 이메일을 확인해주세요.'); // 성공 알림
            setUiState('code-sent'); // UI 상태를 'code-sent'로 변경
        } catch (error: any) {
            console.error("인증번호 발송 실패:", error.response); // 상세 에러 로그

            // 서버 응답에서 에러 메시지를 추출하거나 기본 에러 메시지 사용
            const data = error.response?.data;
            const errorMessage = data?.message || (typeof data === 'string' ? data : '요청 처리 중 오류가 발생했습니다.');
            alert(errorMessage); // 사용자에게 에러 알림
        }
    };

    /**
     * 발송된 인증번호를 확인하는 핸들러입니다.
     */
    const handleVerifyCodeForReset = async () => {
        setUiState('verifying'); // UI 상태를 'verifying'으로 변경 (확인 중...)
        try {
            // `verifyCode` API를 호출하여 인증번호 검증 요청
            const response = await verifyCode(resetEmail, verificationCode);
            if(response.data.verified) { // 인증 성공 시
                alert('인증에 성공했습니다. 새 비밀번호를 입력하세요.'); // 성공 알림
                setUiState('verified'); // UI 상태를 'verified'로 변경 (새 비밀번호 입력 단계)
            } else { // 인증 실패 시
                alert('인증번호가 일치하지 않습니다.'); // 실패 알림
                setUiState('code-sent'); // UI 상태를 다시 'code-sent'로 변경 (인증번호 재입력)
            }
        } catch (error) {
            alert('인증번호 검증에 실패했습니다.'); // API 호출 자체 실패 시
            setUiState('code-sent'); // UI 상태를 다시 'code-sent'로 변경
        }
    };
    
    /**
     * 새 비밀번호로 변경하는 폼 제출 핸들러입니다.
     * @param e - 폼 제출 이벤트 객체
     */
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지
        if(newPassword.length < 8) return alert('비밀번호는 8자 이상으로 설정해주세요.'); // 비밀번호 길이 유효성 검사
        
        // 비밀번호 변경 요청 데이터 객체 생성
        const requestData: ChangePasswordRequest = { email: resetEmail, newPassword };
        try {
            // `changePassword` API를 호출하여 비밀번호 변경 요청
            await changePassword(requestData);
            alert('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.'); // 성공 알림
            navigate('/login'); // 로그인 페이지로 이동
        } catch (error) {
            alert('비밀번호 변경에 실패했습니다.'); // 실패 알림
        }
    };

    return (
        <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4">
            {/* 앱 로고/제목 (클릭 시 홈으로 이동) */}
            <h1 
                className="text-3xl font-extrabold text-blue-600 mb-8 cursor-pointer" 
                onClick={() => navigate('/')}
            >
                SynergyM
            </h1>
            <Card className="w-full max-w-md p-8"> {/* 카드 컨테이너: 최대 너비, 패딩 */}
                {/* 탭 컴포넌트: 아이디 찾기와 비밀번호 찾기 탭을 관리 */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* 탭 헤더 목록 */}
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="find-email">아이디 찾기</TabsTrigger>
                        <TabsTrigger value="find-password">비밀번호 찾기</TabsTrigger>
                    </TabsList>

                    {/* --- 아이디 찾기 탭 내용 --- */}
                    <TabsContent value="find-email">
                        <form onSubmit={handleFindEmail} className="space-y-6 mt-6">
                            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">아이디(이메일) 찾기</h2>
                            {/* 이름 입력 필드 */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                                <Input 
                                    id="name" 
                                    type="text" 
                                    placeholder="가입 시 입력한 이름" 
                                    value={findEmailForm.name} 
                                    onChange={(e) => setFindEmailForm({...findEmailForm, name: e.target.value})} 
                                />
                            </div>
                            {/* 생년월일 입력 필드 */}
                            <div>
                                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">생년월일</label>
                                <Input 
                                    id="birthday" 
                                    type="date" 
                                    value={findEmailForm.birthday} 
                                    onChange={(e) => setFindEmailForm({...findEmailForm, birthday: e.target.value})} 
                                />
                            </div>
                            {/* 아이디 찾기 버튼 */}
                            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md">
                                아이디 찾기
                            </Button>
                            {/* 찾은 이메일이 있을 경우 표시 */}
                            {foundEmail && (
                                <div className="mt-4 text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">회원님의 아이디는</p>
                                    <p className="font-semibold text-lg">{foundEmail}</p> {/* 마스킹된 이메일 */}
                                    <Button variant="link" onClick={() => navigate('/login')}>로그인하기</Button> {/* 로그인 페이지로 이동 링크 */}
                                </div>
                            )}
                        </form>
                    </TabsContent>

                    {/* --- 비밀번호 찾기 탭 내용 --- */}
                    <TabsContent value="find-password">
                        <div className="space-y-6 mt-6">
                            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">비밀번호 찾기</h2>
                            {/* UI 상태가 'idle'일 때 (이메일 입력 및 인증번호 발송 전) */}
                            {uiState === 'idle' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-center text-gray-500">가입 시 사용한 이메일을 입력하고 인증을 진행하세요.</p>
                                    <div>
                                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
                                        <Input 
                                            id="reset-email" 
                                            type="email" 
                                            placeholder="email@example.com" 
                                            value={resetEmail} 
                                            onChange={(e) => setResetEmail(e.target.value)} 
                                        />
                                    </div>
                                    <Button onClick={handleSendCodeForReset} className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md">
                                        인증번호 발송
                                    </Button>
                                </div>
                            )}
                            {/* UI 상태가 'code-sent' 또는 'verifying'일 때 (인증번호 입력 및 확인) */}
                            {(uiState === 'code-sent' || uiState === 'verifying') && (
                                <div className="space-y-4">
                                    <p className="text-sm text-center text-green-600">{resetEmail}(으)로 인증번호를 발송했습니다.</p>
                                    <div>
                                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">인증번호</label>
                                        <Input 
                                            id="code" 
                                            type="text" 
                                            placeholder="인증번호 6자리" 
                                            value={verificationCode} 
                                            onChange={(e) => setVerificationCode(e.target.value)} 
                                        />
                                    </div>
                                    <Button onClick={handleVerifyCodeForReset} disabled={uiState === 'verifying'} className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md">
                                        {uiState === 'verifying' ? '확인 중...' : '인증 확인'} {/* 확인 중일 때 텍스트 변경 */}
                                    </Button>
                                </div>
                            )}
                            {/* UI 상태가 'verified'일 때 (새 비밀번호 설정) */}
                            {uiState === 'verified' && (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <p className="text-sm text-center text-blue-600">인증이 완료되었습니다. 새 비밀번호를 설정하세요.</p>
                                    <div>
                                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">새 비밀번호</label>
                                        <Input 
                                            id="new-password" 
                                            type="password" 
                                            placeholder="8자 이상 입력" 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md">
                                        비밀번호 변경 완료
                                    </Button>
                                </form>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
};

export default FindCredentials;