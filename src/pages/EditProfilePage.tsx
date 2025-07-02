import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { ProfileUser } from '@/types/index';
import { Button } from '@/components/ui/button';
import { HiArrowLeft, HiUser } from 'react-icons/hi';

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
            alert('프로필이 저장되었습니다.');
            navigate('/mypage');
        } catch (error) {
            console.error(error);
            alert('저장에 실패했습니다.');
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
                <button onClick={() => navigate(-1)} className="absolute left-0 p-2">
                    <HiArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">프로필 수정</h1>
            </header>

            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                        <img src={previewImage} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                        <HiUser className="w-14 h-14 text-gray-400" />
                    )}
                </div>
                <label htmlFor="imageUpload" className="mt-2 text-sm font-semibold text-blue-600 cursor-pointer">
                    사진 변경
                </label>
                <input id="imageUpload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">닉네임</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">목표</label>
                    <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">생년월일</label>
                    <input type="date" value={birthday || ''} onChange={(e) => setBirthday(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">성별</label>
                    <select value={gender || ''} onChange={(e) => setGender(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="">선택 안 함</option>
                        <option value="MALE">남성</option>
                        <option value="FEMALE">여성</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">몸무게 (kg)</label>
                    <input type="number" value={weight || ''} onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : null)} className="mt-1 block w-full border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">키 (cm)</label>
                    <input type="number" value={height || ''} onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)} className="mt-1 block w-full border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
            </div>

            <div className="mt-8">
                <Button 
                    onClick={handleSave} 
                    className="w-full !py-3 !text-base !font-bold bg-blue-600 hover:bg-blue-700 text-white" 
                    disabled={isSaving}
                >
                    {isSaving ? '저장 중...' : '저장하기'}
                </Button>
            </div>
        </div>
    );
};

export default EditProfilePage;