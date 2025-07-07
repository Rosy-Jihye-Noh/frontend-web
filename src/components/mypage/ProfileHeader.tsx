import React from 'react';
import { Button } from '../ui/button';
import { HiUser } from 'react-icons/hi';
import type { ProfileUser } from '@/types/index'; // 타입 정의 임포트

interface ProfileHeaderProps {
    user: ProfileUser;
    onEdit: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEdit }) => (
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
        
        {/* ✨ user.profileImageUrl 값의 존재 여부에 따라 조건부 렌더링 */}
        {user.profileImageUrl ? (
            // 이미지가 있을 경우
            <img 
                src={user.profileImageUrl} 
                alt="프로필 사진" 
                className="w-24 h-24 rounded-full shadow-md object-cover" 
            />
        ) : (
            // 이미지가 없을 경우 (기본 아이콘 또는 플레이스홀더)
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