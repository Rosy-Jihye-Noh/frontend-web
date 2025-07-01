import { useState } from 'react';
// useLocation 훅을 새로 임포트합니다.
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { findEmail, checkEmailExists, sendVerificationCode, verifyCode, changePassword } from '@/api/authApi';
import type { FindEmailRequest, ChangePasswordRequest } from '@/types/auth';

const FindCredentials = () => {
    const navigate = useNavigate();
    // useLocation 훅을 사용하여 현재 위치(경로) 정보 가져오기
    const location = useLocation();

    // location.state에서 initialTab 값을 읽어온다
    // 없으면 'find-email'을 기본값으로 사용
    const initialTab = location.state?.initialTab || 'find-email';

    // 읽어온 initialTab 값으로 activeTab 상태를 초기화
    const [activeTab, setActiveTab] = useState(initialTab);

    const [findEmailForm, setFindEmailForm] = useState<FindEmailRequest>({ name: '', birthday: '' });
    const [foundEmail, setFoundEmail] = useState<string | null>(null);
    const [resetEmail, setResetEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [uiState, setUiState] = useState<'idle' | 'code-sent' | 'verifying' | 'verified'>('idle');

    const handleFindEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setFoundEmail(null);
        try {
            const response = await findEmail(findEmailForm);
            const email = response.data;
            const parts = email.split('@');
            const maskedUser = parts[0].length > 2 ? parts[0].substring(0, 2) + '*'.repeat(parts[0].length - 2) : parts[0];
            setFoundEmail(`${maskedUser}@${parts[1]}`);
        } catch (error) {
            alert('일치하는 사용자 정보가 없습니다.');
        }
    };

    const handleSendCodeForReset = async () => {
        if (!resetEmail) return alert('이메일을 입력해주세요.');
        try {
            const response = await checkEmailExists(resetEmail);
            if (!response.data.exists) {
                return alert('가입되지 않은 이메일입니다.');
            }
            await sendVerificationCode(resetEmail);
            alert('인증번호가 발송되었습니다. 이메일을 확인해주세요.');
            setUiState('code-sent');
        } catch (error) {
            alert('인증번호 발송에 실패했습니다.');
        }
    };

    const handleVerifyCodeForReset = async () => {
        setUiState('verifying');
        try {
            const response = await verifyCode(resetEmail, verificationCode);
            if(response.data.verified) {
                alert('인증에 성공했습니다. 새 비밀번호를 입력하세요.');
                setUiState('verified');
            } else {
                alert('인증번호가 일치하지 않습니다.');
                setUiState('code-sent');
            }
        } catch (error) {
            alert('인증번호 검증에 실패했습니다.');
            setUiState('code-sent');
        }
    };
    
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if(newPassword.length < 8) return alert('비밀번호는 8자 이상으로 설정해주세요.');
        const requestData: ChangePasswordRequest = { email: resetEmail, newPassword };
        try {
            await changePassword(requestData);
            alert('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (error) {
            alert('비밀번호 변경에 실패했습니다.');
        }
    };


    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-extrabold text-blue-600 mb-8 cursor-pointer" onClick={() => navigate('/')}>SynergyM</h1>
            <Card className="w-full max-w-md p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="find-email">아이디 찾기</TabsTrigger>
                        <TabsTrigger value="find-password">비밀번호 찾기</TabsTrigger>
                    </TabsList>

                    {/* 아이디 찾기 탭 */}
                    <TabsContent value="find-email">
                        {/* ... 아이디 찾기 폼 ... */}
                        <form onSubmit={handleFindEmail} className="space-y-6 mt-6">
                            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">아이디(이메일) 찾기</h2>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                                <Input id="name" type="text" placeholder="가입 시 입력한 이름" value={findEmailForm.name} onChange={(e) => setFindEmailForm({...findEmailForm, name: e.target.value})} />
                            </div>
                            <div>
                                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">생년월일</label>
                                <Input id="birthday" type="date" value={findEmailForm.birthday} onChange={(e) => setFindEmailForm({...findEmailForm, birthday: e.target.value})} />
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md">
                                아이디 찾기
                            </Button>
                            {foundEmail && (
                                <div className="mt-4 text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">회원님의 아이디는</p>
                                    <p className="font-semibold text-lg">{foundEmail}</p>
                                    <Button variant="link" onClick={() => navigate('/login')}>로그인하기</Button>
                                </div>
                            )}
                        </form>
                    </TabsContent>

                    {/* 비밀번호 찾기 탭 */}
                    <TabsContent value="find-password">
                        {/* ... 비밀번호 찾기 폼 ... */}
                         <div className="space-y-6 mt-6">
                             <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">비밀번호 찾기</h2>
                             {uiState === 'idle' && (
                                 <div className="space-y-4">
                                     <p className="text-sm text-center text-gray-500">가입 시 사용한 이메일을 입력하고 인증을 진행하세요.</p>
                                     <div>
                                         <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
                                         <Input id="reset-email" type="email" placeholder="email@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                                     </div>
                                     <Button onClick={handleSendCodeForReset} className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md">
                                        인증번호 발송
                                     </Button>
                                 </div>
                             )}
                             {(uiState === 'code-sent' || uiState === 'verifying') && (
                                 <div className="space-y-4">
                                     <p className="text-sm text-center text-green-600">{resetEmail}(으)로 인증번호를 발송했습니다.</p>
                                     <div>
                                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">인증번호</label>
                                        <Input id="code" type="text" placeholder="인증번호 6자리" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                                     </div>
                                     <Button onClick={handleVerifyCodeForReset} disabled={uiState === 'verifying'} className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium py-3 rounded-md">
                                        {uiState === 'verifying' ? '확인 중...' : '인증 확인'}
                                     </Button>
                                 </div>
                             )}
                             {uiState === 'verified' && (
                                 <form onSubmit={handleChangePassword} className="space-y-4">
                                     <p className="text-sm text-center text-blue-600">인증이 완료되었습니다. 새 비밀번호를 설정하세요.</p>
                                     <div>
                                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">새 비밀번호</label>
                                        <Input id="new-password" type="password" placeholder="8자 이상 입력" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
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
