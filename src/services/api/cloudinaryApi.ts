import axiosInstance from '@/api/axiosInstance';

/**
 * Cloudinary에 이미지를 업로드하고 업로드된 이미지의 URL을 반환합니다.
 * @param file 업로드할 이미지 파일
 * @returns 업로드된 이미지의 Cloudinary URL
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post('/cloudinary/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}; 