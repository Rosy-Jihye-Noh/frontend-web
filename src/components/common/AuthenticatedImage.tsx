import { useState, useEffect } from 'react';
import { fetchAuthenticatedImage, revokeObjectUrl } from '@/utils/imageUtils';

interface AuthenticatedImageProps {
  src: string; // API endpoint URL
  alt: string;
  className?: string;
  fallbackSrc?: string; // 로딩 실패 시 대체 이미지
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 인증이 필요한 이미지를 안전하게 표시하는 컴포넌트
 * Authorization 헤더를 포함하여 이미지를 로드합니다.
 */
const AuthenticatedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc, 
  onLoad, 
  onError 
}: AuthenticatedImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return; // src가 없으면 실행 중단
    }

    let isMounted = true;

    const fetchImage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // 1. axios 인스턴스를 사용해 Blob 형태로 이미지 데이터를 요청
        //    (자동으로 Authorization 헤더가 포함됩니다)
        const objectUrl = await fetchAuthenticatedImage(src);
        
        if (isMounted) {
          if (objectUrl) {
            // 2. 받아온 Blob URL을 state에 저장
            setImageUrl(objectUrl);
            onLoad?.();
          } else {
            setHasError(true);
            onError?.();
          }
        }
      } catch (error) {
        console.error('인증된 이미지를 불러오는 데 실패했습니다:', error);
        if (isMounted) {
          setHasError(true);
          onError?.();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    // 컴포넌트가 화면에서 사라질 때, 생성했던 임시 URL을 메모리에서 해제합니다.
    return () => {
      isMounted = false;
      if (imageUrl) {
        revokeObjectUrl(imageUrl);
      }
    };
  }, [src]);

  // 컴포넌트 언마운트 시 Object URL 정리
  useEffect(() => {
    return () => {
      if (imageUrl) {
        revokeObjectUrl(imageUrl);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <span className="text-gray-500 text-sm">Loading...</span>
      </div>
    );
  }

  if (hasError && fallbackSrc) {
    return (
      <img 
        src={fallbackSrc} 
        alt={alt} 
        className={className}
      />
    );
  }

  if (hasError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500 text-sm">이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl || ''} 
      alt={alt} 
      className={className}
    />
  );
};

export default AuthenticatedImage;
