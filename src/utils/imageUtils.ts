import axiosInstance from '@/api/axiosInstance';

// 이미지 캐시를 위한 Map (선택적 성능 최적화)
const imageCache = new Map<string, string>();

/**
 * 인증이 필요한 이미지를 Blob으로 다운로드하고 Object URL을 생성합니다.
 * @param imageUrl - 이미지 API URL (예: "/users/123/profile-image")
 * @returns Promise<string | null> - Object URL 또는 null (에러 시)
 */
export const fetchAuthenticatedImage = async (imageUrl: string): Promise<string | null> => {
  try {
    // 캐시된 이미지가 있는지 확인
    if (imageCache.has(imageUrl)) {
      return imageCache.get(imageUrl)!;
    }

    // 1. apiClient(axiosInstance)를 사용해 Blob 형태로 이미지 데이터를 요청
    //    (자동으로 Authorization 헤더가 포함됩니다)
    const response = await axiosInstance.get(imageUrl, {
      responseType: 'blob', // 응답을 반드시 Blob 데이터로 받습니다.
    });

    // 2. 받아온 Blob 데이터로 브라우저 메모리에 임시 URL을 생성
    const imageBlob = response.data;
    const objectUrl = URL.createObjectURL(imageBlob);
    
    // 캐시에 저장 (선택적)
    imageCache.set(imageUrl, objectUrl);
    
    return objectUrl;
  } catch (error) {
    console.error('프로필 이미지를 불러오는 데 실패했습니다:', error);
    return null;
  }
};

/**
 * Object URL을 해제합니다. (메모리 누수 방지)
 * @param objectUrl - 해제할 Object URL
 */
export const revokeObjectUrl = (objectUrl: string) => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    
    // 캐시에서도 제거
    for (const [key, value] of imageCache.entries()) {
      if (value === objectUrl) {
        imageCache.delete(key);
        break;
      }
    }
  }
};

/**
 * 모든 캐시된 이미지 URL을 정리합니다.
 */
export const clearImageCache = () => {
  for (const objectUrl of imageCache.values()) {
    URL.revokeObjectURL(objectUrl);
  }
  imageCache.clear();
};

/**
 * 이미지 파일을 미리보기용 Object URL로 변환합니다.
 * @param file - 이미지 파일
 * @returns string - Object URL
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};
