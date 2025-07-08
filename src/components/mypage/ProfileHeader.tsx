import React from 'react';
import { Button } from '../ui/button';
import { HiUser } from 'react-icons/hi';
import ProfileImage from '../common/ProfileImage';
import type { ProfileUser } from '@/types/index'; // 타입 정의 임포트

interface ProfileHeaderProps {
    user: ProfileUser;
    onEdit: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEdit }) => (
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
        
        {/* ProfileImage 컴포넌트를 사용하여 인증된 이미지 로드 */}
        {user.id ? (
            <ProfileImage 
                userId={user.id}
                className="w-24 h-24 rounded-full shadow-md object-cover"
                alt="프로필 사진"
                style={{ width: '96px', height: '96px', borderRadius: '50%' }}
            />
        ) : (
            // 사용자 ID가 없을 경우 기본 아이콘
            <div className="w-24 h-24 rounded-full shadow-md bg-muted flex items-center justify-center">
                <HiUser className="w-14 h-14 text-gray-400" />
            </div>
        )}

        <div className="flex-grow text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{user.goal}</p>
        </div>
        <Button onClick={onEdit} variant="secondary" className="!py-2 !px-4">프로필 수정</Button>
    </div>
);

export default ProfileHeader;