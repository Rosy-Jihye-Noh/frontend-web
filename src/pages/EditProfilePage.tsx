import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { ProfileUser } from '@/types/index';
import { Button } from '@/components/ui/button';
import { HiArrowLeft, HiUser } from 'react-icons/hi';
import { toast } from 'sonner';

const EditProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
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

        const fetchUserData = async (userId: number) => {
            try {
                const res = await fetch(`http://localhost:8081/api/users/${userId}`);
                if (!res.ok) throw new Error('사용자 정보 로딩 실패');
                
                const userData: ProfileUser = await res.json();
                
                // 가져온 데이터로 모든 폼 상태 초기화
                setName(userData.name);
                setGoal(userData.goal || '');
                setBirthday(userData.birthday || null);
                setGender(userData.gender || null);
                setWeight(userData.weight || null);
                setHeight(userData.height || null);
                setPreviewImage(userData.profileImageUrl);
            } catch (error) {
                console.error(error);
                alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
            }
        };

        fetchUserData(user.id);
    }, [hasHydrated, user, navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        
        const formData = new FormData();
        const userDTO = { name, goal, birthday, gender, weight, height };
        formData.append('userDTO', new Blob([JSON.stringify(userDTO)], { type: 'application/json' }));

        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        try {
            await fetch(`http://localhost:8081/api/users/${user.id}`, { method: 'PUT', body: formData });
            toast.success('프로필이 변경되었습니다');
            navigate('/mypage');
        } catch (error) {
            console.error(error);
            toast.error('저장에 실패했습니다');
        } finally {
            setIsSaving(false);
        }
    };

    if (!hasHydrated) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    return (
        <div className="max-w-md mx-auto p-4 bg-white min-h-screen">
            <header className="relative flex items-center justify-center py-4 mb-6">
                <button onClick={() => navigate(-1)} className="absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <HiArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">프로필 수정</h1>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">닉네임</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                        placeholder="닉네임을 입력하세요"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">목표</label>
                    <input 
                        type="text" 
                        value={goal} 
                        onChange={(e) => setGoal(e.target.value)} 
                        className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                        placeholder="운동 목표를 입력하세요"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">생년월일</label>
                    <input 
                        type="date" 
                        value={birthday || ''} 
                        onChange={(e) => setBirthday(e.target.value)} 
                        className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">성별</label>
                    <select 
                        value={gender || ''} 
                        onChange={(e) => setGender(e.target.value)} 
                        className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                        <option value="">선택 안 함</option>
                        <option value="MALE">남성</option>
                        <option value="FEMALE">여성</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">몸무게 (kg)</label>
                        <input 
                            type="number" 
                            value={weight || ''} 
                            onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : null)} 
                            className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                            placeholder="kg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">키 (cm)</label>
                        <input 
                            type="number" 
                            value={height || ''} 
                            onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)} 
                            className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
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