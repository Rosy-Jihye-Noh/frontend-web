import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { ProfileUser } from '@/types/index';
import { Button } from '@/components/ui/button';
import { HiArrowLeft, HiUser } from 'react-icons/hi';
import { toast } from 'sonner'; // 토스트 알림 라이브러리
import axiosInstance from '@/api/axiosInstance';
import { fetchAuthenticatedImage, revokeObjectUrl } from '@/utils/imageUtils'; // 인증된 이미지 요청 및 URL 해제 유틸리티

// EditProfilePage 함수형 컴포넌트 정의
const EditProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
    const updateUser = useUserStore((state) => state.updateUser);
    const hasHydrated = useUserStore.persist.hasHydrated();
    const [isSaving, setIsSaving] = useState(false);

    // 폼 입력 필드들을 위한 상태 관리
    const [name, setName] = useState(''); // 닉네임
    const [goal, setGoal] = useState(''); // 운동 목표
    const [birthday, setBirthday] = useState<string | null>(null); // 생년월일 (YYYY-MM-DD)
    const [gender, setGender] = useState<string | null>(null); // 성별 ('MALE', 'FEMALE')
    const [weight, setWeight] = useState<number | null>(null); // 몸무게
    const [height, setHeight] = useState<number | null>(null); // 키
    const [profileImage, setProfileImage] = useState<File | null>(null); // 사용자가 선택한 새 프로필 이미지 파일
    const [previewImage, setPreviewImage] = useState<string | null>(null); // 프로필 이미지 미리보기 URL (Blob URL 또는 기존 URL)

    // 컴포넌트 마운트 시 또는 사용자 정보 로드 상태 변경 시 실행되는 useEffect
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
                // 특정 사용자 정보를 가져오는 GET 요청
                const res = await axiosInstance.get(`/users/${userId}`);
                if (res.status !== 200) throw new Error('사용자 정보 로딩 실패');
                
                const userData: ProfileUser = res.data; // 응답 데이터 (ProfileUser 타입)
                
                // 가져온 데이터로 모든 폼 상태 초기화
                setName(userData.name);
                setGoal(userData.goal || ''); // goal이 null이면 빈 문자열로
                setBirthday(userData.birthday || null); // birthday가 null이면 null로
                setGender(userData.gender || null); // gender가 null이면 null로
                setWeight(userData.weight || null); // weight가 null이면 null로
                setHeight(userData.height || null); // height가 null이면 null로
                
                // 프로필 이미지 URL이 존재하면 인증된 요청으로 이미지를 불러와 미리보기 설정
                if (userData.profileImageUrl) {
                    const imageObjectUrl = await fetchAuthenticatedImage(`/users/${userId}/profile-image`);
                    if (imageObjectUrl) {
                        setPreviewImage(imageObjectUrl); // 이미지 미리보기 URL 설정
                    }
                }
            } catch (error) {
                console.error(error);
                alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
            }
        };

        fetchUserData(user.id); // 현재 로그인된 사용자 ID로 정보 불러오기 시작
        
        // 클린업 함수: 컴포넌트 언마운트 시 생성된 Object URL(blob URL)을 해제하여 메모리 누수 방지
        return () => {
            if (previewImage && previewImage.startsWith('blob:')) {
                revokeObjectUrl(previewImage); // URL.revokeObjectURL 호출
            }
        };
    }, [hasHydrated, user, navigate]); // 의존성 배열: 이 값들이 변경될 때마다 useEffect 재실행

    /**
     * 파일 입력 필드(input type="file")의 변경 이벤트 핸들러입니다.
     * 선택된 이미지 파일을 검증하고 미리보기 URL을 생성합니다.
     * @param e - 파일 입력 변경 이벤트 객체
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]; // 선택된 파일

            // 1. 파일 크기 체크 (5MB 제한)
            const maxSize = 5 * 1024 * 1024; // 5MB를 바이트 단위로
            if (file.size > maxSize) {
                toast.error('프로필 이미지는 5MB 이하여야 합니다.'); // 에러 알림
                e.target.value = ''; // 입력 필드 초기화 (동일 파일 재선택 가능하게 함)
                return;
            }
            
            // 2. 파일 타입 체크 (JPG, PNG, GIF만 허용)
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다.');
                e.target.value = ''; // 입력 필드 초기화
                return;
            }
            
            setProfileImage(file); // 선택된 파일 객체를 상태에 저장
            setPreviewImage(URL.createObjectURL(file)); // 파일의 Blob URL을 생성하여 미리보기 이미지로 설정
            toast.success('이미지가 선택되었습니다.'); // 성공 알림
        }
    };

    /**
     * '저장하기' 버튼 클릭 시 호출되는 비동기 핸들러입니다.
     * 사용자 프로필 정보를 서버에 업데이트하고, 전역 상태를 갱신합니다.
     */
    const handleSave = async () => {
        if (!user) return; // 사용자 정보가 없으면 저장 불가
        setIsSaving(true); // 저장 중 상태로 변경

        // FormData 객체 생성: 파일과 JSON 데이터를 함께 전송하기 위함
        const formData = new FormData();
        // userDTO 객체 생성 (사용자 정보 필드)
        const userDTO = { name, goal, birthday, gender, weight, height };
        // userDTO를 JSON 문자열로 변환하여 Blob으로 만든 후 FormData에 추가 (Content-Type: application/json)
        formData.append('userDTO', new Blob([JSON.stringify(userDTO)], { type: 'application/json' }));

        if (profileImage) { // 새 프로필 이미지가 선택되었다면
            // 이미지 크기 다시 한번 체크 (클라이언트 측 추가 검증)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (profileImage.size > maxSize) {
                toast.error('프로필 이미지는 5MB 이하여야 합니다.');
                setIsSaving(false);
                return;
            }
            formData.append('profileImage', profileImage); // FormData에 이미지 파일 추가
        }

        try {
            // 사용자 프로필 정보를 업데이트하는 PUT 요청
            const response = await axiosInstance.put(`/users/${user.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // FormData 사용 시 필수
                }
            });
            
            if (response.status !== 200) {
                const errorText = response.statusText; // 응답 상태 텍스트
                
                // 서버에서 발생할 수 있는 파일 크기 초과 에러 메시지 확인
                if (errorText.includes('MaxUploadSizeExceededException') || 
                    errorText.includes('Maximum upload size exceeded') ||
                    response.status === 413) { // 413 Payload Too Large 상태 코드도 확인
                    toast.error('업로드 파일 크기가 너무 큽니다. 5MB 이하의 이미지를 선택해주세요.');
                    setIsSaving(false);
                    return; // 함수 종료
                }
                
                throw new Error('프로필 수정에 실패했습니다.'); // 일반적인 오류 메시지
            }
            
            // 저장 성공 시 userStore의 전역 사용자 정보 업데이트
            updateUser({
                name, // 변경된 이름으로 업데이트
                goal, // 변경된 목표로 업데이트
                // 프로필 이미지 URL은 새로 생성된 미리보기 URL이 있으면 그것으로, 없으면 기존 URL로 업데이트
                profileImageUrl: previewImage || user.profileImageUrl 
            });
            
            // 성공 토스트 알림 표시
            toast.success('✅ 프로필이 성공적으로 변경되었습니다!', {
                description: '변경사항이 저장되어 다른 페이지에서도 반영됩니다.',
                duration: 4000, // 4초 동안 표시
            });
            
            // 1.5초 후 마이페이지로 이동
            setTimeout(() => {
                navigate('/mypage');
            }, 1500);
            
        } catch (error) {
            console.error('프로필 저장 실패:', error);
            toast.error('저장에 실패했습니다. 다시 시도해주세요.'); // 사용자에게 오류 알림
        } finally {
            setIsSaving(false); // 저장 중 상태 해제
        }
    };

    // `userStore`의 데이터가 아직 로드되지 않았다면 로딩 메시지 표시
    if (!hasHydrated) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    // 컴포넌트 렌더링 부분
    return (
        <div className="max-w-md mx-auto p-4 bg-background min-h-screen"> {/* 최대 너비, 중앙 정렬, 패딩, 배경색, 최소 높이 */}
            <header className="relative flex items-center justify-center py-4 mb-6"> {/* 헤더 섹션 */}
                {/* 뒤로 가기 버튼 */}
                <button onClick={() => navigate(-1)} className="absolute left-0 p-2 hover:bg-muted rounded-full transition-colors">
                    <HiArrowLeft className="w-6 h-6 text-muted-foreground" />
                </button>
                <h1 className="text-xl font-bold text-foreground">프로필 수정</h1> {/* 페이지 제목 */}
            </header>

            <div className="flex flex-col items-center mb-8"> {/* 프로필 이미지 섹션 */}
                {/* 프로필 이미지 미리보기 영역 */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-blue-100">
                    {previewImage ? ( // 미리보기 이미지가 있으면 이미지 표시
                        <img src={previewImage} alt="프로필" className="w-full h-full object-cover" />
                    ) : ( // 없으면 기본 사용자 아이콘 표시
                        <HiUser className="w-16 h-16 text-blue-400" />
                    )}
                </div>
                {/* '사진 변경' 라벨 (파일 입력 필드와 연결) */}
                <label htmlFor="imageUpload" className="mt-3 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
                    사진 변경
                </label>
                {/* 실제 파일 입력 필드 (숨김) */}
                <input id="imageUpload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="space-y-6"> {/* 입력 폼 필드 섹션 */}
                {/* 닉네임 입력 필드 */}
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
                {/* 목표 입력 필드 */}
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
                {/* 생년월일 입력 필드 */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">생년월일</label>
                    <input 
                        type="date" 
                        value={birthday || ''} // null일 경우 빈 문자열로 처리하여 경고 방지
                        onChange={(e) => setBirthday(e.target.value)} 
                        className="w-full border-2 border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    />
                </div>
                {/* 성별 선택 드롭다운 */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">성별</label>
                    <select 
                        value={gender || ''} // null일 경우 빈 문자열로 처리
                        onChange={(e) => setGender(e.target.value)} 
                        className="w-full border-2 border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-background"
                    >
                        <option value="">선택 안 함</option> {/* 기본 옵션 */}
                        <option value="MALE">남성</option>
                        <option value="FEMALE">여성</option>
                    </select>
                </div>
                {/* 몸무게 및 키 입력 필드 (그리드 레이아웃) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">몸무게 (kg)</label>
                        <input 
                            type="number" 
                            value={weight || ''} // null일 경우 빈 문자열로 처리
                            onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : null)} // 입력값이 있으면 숫자로 변환, 없으면 null
                            className="w-full border-2 border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                            placeholder="kg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">키 (cm)</label>
                        <input 
                            type="number" 
                            value={height || ''} // null일 경우 빈 문자열로 처리
                            onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)} // 입력값이 있으면 숫자로 변환, 없으면 null
                            className="w-full border-2 border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                            placeholder="cm"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8"> {/* 저장 버튼 섹션 */}
                <Button 
                    onClick={handleSave} // 저장 핸들러 호출
                    className="w-full py-4 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl" 
                    disabled={isSaving} // 저장 중일 때 버튼 비활성화
                >
                    {isSaving ? '저장 중...' : '저장하기'} {/* 저장 중 상태에 따라 텍스트 변경 */}
                </Button>
            </div>
        </div>
    );
};

export default EditProfilePage;