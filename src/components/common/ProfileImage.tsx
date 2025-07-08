import React, { useState, useEffect } from 'react';
import { fetchAuthenticatedImage, revokeObjectUrl } from '@/utils/imageUtils';

interface ProfileImageProps {
  userId: number;
  className?: string;
  alt?: string;
  defaultImage?: string;
  style?: React.CSSProperties;
}

/**
 * 인증이 필요한 프로필 이미지를 표시하는 컴포넌트
 * 제공된 예시 코드와 동일한 패턴으로 구현
 */
const ProfileImage: React.FC<ProfileImageProps> = ({ 
  userId, 
  className = '',
  alt = 'Profile Avatar',
  defaultImage = '/images/default-avatar.png',
  style = { width: '100px', height: '100px', borderRadius: '50%' }
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null); // 이미지 URL을 저장할 state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return; // userId가 없으면 실행 중단
    }

    const fetchImage = async () => {
      try {
        // 1. apiClient를 사용해 Blob 형태로 이미지 데이터를 요청합니다.
        //    (자동으로 Authorization 헤더가 포함됩니다)
        const blobUrl = await fetchAuthenticatedImage(`/users/${userId}/profile-image`);
        
        // 2. 받아온 Blob URL을 state에 저장
        setImageUrl(blobUrl);

      } catch (error) {
        console.error('프로필 이미지를 불러오는 데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // 컴포넌트가 화면에서 사라질 때, 생성했던 임시 URL을 메모리에서 해제합니다.
    return () => {
      if (imageUrl) {
        revokeObjectUrl(imageUrl);
      }
    };
  }, [userId]); // userId가 바뀔 때마다 다시 실행됩니다.

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200 animate-pulse`} style={style}>
        <span className="text-gray-500 text-xs">로딩 중...</span>
      </div>
    ); // 로딩 중 표시
  }

  // 3. <img> 태그의 src에 API 주소가 아닌, 위에서 생성한 임시 blob URL을 사용합니다.
  return (
    <img 
      src={imageUrl || defaultImage} // 이미지가 없으면 기본 이미지 표시
      alt={alt}
      className={className}
      style={style}
    />
  );
};

export default ProfileImage;
