import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { fetchAuthenticatedImage, revokeObjectUrl, createImagePreview } from "@/utils/imageUtils";

interface ProfileImageUploadProps {
  onChange: (file: File | null) => void;
  currentImageUrl?: string; // 기존 프로필 이미지 URL (선택적)
  userId?: number; // 사용자 ID (기존 이미지 로드용)
}

const ProfileImageUpload = ({ onChange, currentImageUrl, userId }: ProfileImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 기존 프로필 이미지 로드
  useEffect(() => {
    if (currentImageUrl && userId) {
      const loadExistingImage = async () => {
        const objectUrl = await fetchAuthenticatedImage(`/users/${userId}/profile-image`);
        if (objectUrl) {
          setPreviewUrl(objectUrl);
        }
      };
      loadExistingImage();
    }

    // 컴포넌트 언마운트 시 Object URL 정리
    return () => {
      if (previewUrl) {
        revokeObjectUrl(previewUrl);
      }
    };
  }, [currentImageUrl, userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    
    // 이전 미리보기 URL 정리
    if (previewUrl) {
      revokeObjectUrl(previewUrl);
    }

    if (file) {
      // 새로운 파일의 미리보기 생성
      const newPreviewUrl = createImagePreview(file);
      setPreviewUrl(newPreviewUrl);
    } else {
      setPreviewUrl(null);
    }

    onChange(file);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="profile-image">프로필 이미지 업로드</Label>
      
      {/* 이미지 미리보기 */}
      {previewUrl && (
        <div className="flex justify-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
            <img 
              src={previewUrl} 
              alt="프로필 이미지 미리보기" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      
      <Input
        id="profile-image"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfileImageUpload;