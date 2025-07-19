import React from 'react';
import { Button } from '../ui/button';
import { User, Edit } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import type { ProfileUser } from '@/types/index';
import { Card } from '@/components/ui/card';

interface ProfileHeaderProps {
    user: ProfileUser;
    onEdit: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEdit }) => (
    <Card className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 p-6 rounded-2xl shadow-md bg-card">
        {user.id ? (
            <ProfileImage 
                userId={user.id}
                className="w-28 h-28 rounded-full shadow-lg object-cover border-4 border-background"
                alt="프로필 사진"
            />
        ) : (
            <div className="w-28 h-28 rounded-full shadow-lg bg-muted flex items-center justify-center border-4 border-background">
                <User className="w-16 h-16 text-neutral-400" />
            </div>
        )}

        <div className="flex-grow text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-foreground">{user.name}</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-md">{user.goal || '목표를 설정해보세요.'}</p>
        </div>
        <Button onClick={onEdit} variant="outline" className="rounded-lg font-semibold transition-all hover:bg-muted/80">
            <Edit className="w-4 h-4 mr-2" />
            프로필 수정
        </Button>
    </Card>
);

export default ProfileHeader;