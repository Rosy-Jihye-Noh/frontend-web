import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { ProfileUser } from '@/types/index';
import { Button } from '@/components/ui/button';
import { HiArrowLeft, HiUser } from 'react-icons/hi';
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosInstance';
import { fetchAuthenticatedImage, revokeObjectUrl } from '@/utils/imageUtils';

const EditProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
    const updateUser = useUserStore((state) => state.updateUser);
    const hasHydrated = useUserStore.persist.hasHydrated();

    const [isSaving, setIsSaving] = useState(false);
    
    // 폼 상태 관리
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [birthday, setBirthday] = useState<string | null>(null);
    const [gender, setGender] = useState<string | null>(null);
    const [weight, setWeight] = useState<number | null>(null);
    const [height, setHeight] = useState<number | null>(null);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        if (!hasHydrated) {
            return;
        }
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        /**
         * 사용자 ID를 기반으로 서버에서 사용자 정보를 불러와 폼 상태를 초기화하는 비동기 함수입니다.
         * @param userId - 정보를 가져올 사용자의 ID
         */
        const fetchUserData = async (userId: number) => {
            try {
                const res = await axiosInstance.get(`/users/${userId}`);
                if (res.status !== 200) throw new Error('사용자 정보 로딩 실패');
                
                const userData: ProfileUser = res.data;
                
                // 가져온 데이터로 모든 폼 상태 초기화
                setName(userData.name);
                setGoal(userData.goal || '');
                setBirthday(userData.birthday || null);
                setGender(userData.gender || null);
                setWeight(userData.weight || null);
                setHeight(userData.height || null);
                
                // 프로필 이미지가 있으면 인증된 요청으로 로드
                if (userData.profileImageUrl) {
                    const imageObjectUrl = await fetchAuthenticatedImage(`/users/${userId}/profile-image`);
                    if (imageObjectUrl) {
                        setPreviewImage(imageObjectUrl);
                    }
                }
            } catch (error) {
                console.error(error);
                alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
            }
        };

        fetchUserData(user.id);
        
        // 컴포넌트 언마운트 시 Object URL 정리
        return () => {
            if (previewImage && previewImage.startsWith('blob:')) {
                revokeObjectUrl(previewImage);
            }
        };
    }, [hasHydrated, user, navigate]);

    /**
     * 파일 입력 필드(input type="file")의 변경 이벤트 핸들러입니다.
     * 선택된 이미지 파일을 검증하고 미리보기 URL을 생성합니다.
     * @param e - 파일 입력 변경 이벤트 객체
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // 파일 크기 체크 (5MB 제한)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                toast.error('프로필 이미지는 5MB 이하여야 합니다.');
                e.target.value = ''; // 입력 초기화
                return;
            }
            
            // 파일 타입 체크
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다.');
                e.target.value = ''; // 입력 초기화
                return;
            }
            
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
            toast.success('이미지가 선택되었습니다.');
        }
    };

    /**
     * '저장하기' 버튼 클릭 시 호출되는 비동기 핸들러입니다.
     * 사용자 프로필 정보를 서버에 업데이트하고, 전역 상태를 갱신합니다.
     */
    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        
        const formData = new FormData();
        const userDTO = { name, goal, birthday, gender, weight, height };
        formData.append('userDTO', new Blob([JSON.stringify(userDTO)], { type: 'application/json' }));

        if (profileImage) {
            // 파일 크기 체크 (5MB 제한)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (profileImage.size > maxSize) {
                toast.error('프로필 이미지는 5MB 이하여야 합니다.');
                setIsSaving(false);
                return;
            }
            formData.append('profileImage', profileImage);
        }

        try {
            const response = await axiosInstance.put(`/users/${user.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            if (response.status !== 200) {
                const errorText = response.statusText;
                
                // 파일 크기 초과 에러 체크
                if (errorText.includes('MaxUploadSizeExceededException') || 
                    errorText.includes('Maximum upload size exceeded') ||
                    response.status === 413) {
                    toast.error('업로드 파일 크기가 너무 큽니다. 5MB 이하의 이미지를 선택해주세요.');
                    return;
                }
                
                throw new Error('프로필 수정에 실패했습니다.');
            }
            
            // 저장 성공 시 userStore 업데이트
            updateUser({
                name,
                goal,
                profileImageUrl: previewImage || user.profileImageUrl
            });
            
            // 성공 메시지를 더 구체적으로 표시
            toast.success('✅ 프로필이 성공적으로 변경되었습니다!', {
                description: '변경사항이 저장되어 다른 페이지에서도 반영됩니다.',
                duration: 4000,
            });
            
            // 잠시 후 페이지 이동
            setTimeout(() => {
                navigate('/mypage');
            }, 1500);
            
        } catch (error) {
            console.error('프로필 저장 실패:', error);
            toast.error('저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!hasHydrated) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    return (
        <div className="max-w-md mx-auto p-4 bg-background min-h-screen">
            <header className="relative flex items-center justify-center py-4 mb-6">
                <button onClick={() => navigate(-1)} className="absolute left-0 p-2 hover:bg-muted rounded-full transition-colors">
                    <HiArrowLeft className="w-6 h-6 text-muted-foreground" />
                </button>
                <h1 className="text-xl font-bold text-foreground">프로필 수정</h1>
            </header>

            <div className="flex flex-col items-center mb-8">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-blue-100">
                    {previewImage ? (
                        <img src={previewImage} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                        <HiUser className="w-16 h-16 text-blue-400" />
                    )}
                </div>
                <label htmlFor="imageUpload" className="mt-3 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
                    사진 변경
                </label>
                <input id="imageUpload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">닉네임</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full border-2 border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                        placeholder="닉네임을 입력하세요"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">목표</label>
                    <input 
                        type="text" 
                        value={goal} 
                        onChange={(e) => setGoal(e.target.value)} 
                        className="w-full border-2 border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                        placeholder="운동 목표를 입력하세요"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">생년월일</label>
                    <input 
                        type="date" 
                        value={birthday || ''} 
                        onChange={(e) => setBirthday(e.target.value)} 
                        className="w-full border-2 border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">성별</label>
                    <select 
                        value={gender || ''} 
                        onChange={(e) => setGender(e.target.value)} 
                        className="w-full border-2 border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-background"
                    >
                        <option value="">선택 안 함</option>
                        <option value="MALE">남성</option>
                        <option value="FEMALE">여성</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">몸무게 (kg)</label>
                        <input 
                            type="number" 
                            value={weight || ''} 
                            onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : null)} 
                            className="w-full border-2 border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                            placeholder="kg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">키 (cm)</label>
                        <input 
                            type="number" 
                            value={height || ''} 
                            onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)} 
                            className="w-full border-2 border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                            placeholder="cm"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <Button 
                    onClick={handleSave} 
                    className="w-full py-4 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl" 
                    disabled={isSaving}
                >
                    {isSaving ? '저장 중...' : '저장하기'}
                </Button>
            </div>
        </div>
    );
};

export default EditProfilePage;