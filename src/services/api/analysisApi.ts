import axiosInstance from '@/api/axiosInstance';
import type { AnalysisHistoryItem } from '@/types/index';

export const fetchAnalysisDetail = async (analysisId: number): Promise<AnalysisHistoryItem> => {
  const res = await axiosInstance.get(`/analysis-histories/${analysisId}`);
  return res.data;
}; 

/**
 * Cloudinary URL을 이용해 분석을 요청합니다.
 * @param userId 사용자 ID
 * @param imageUrl Cloudinary 이미지 URL
 * @param mode 분석 모드 (예: 'front', 'side')
 * @returns 분석 결과 DTO
 */
export const requestAnalysis = async (
  userId: number,
  imageUrl: string,
  mode: string
): Promise<AnalysisHistoryItem> => {
  console.log('requestAnalysis 호출됨', userId, imageUrl, mode);
  const res = await axiosInstance.post(`/analysis-histories/user/${userId}`, {
    imageUrl,
    mode
  });
  return res.data;
}; 