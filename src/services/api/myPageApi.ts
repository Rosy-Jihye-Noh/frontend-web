import type { ProfileUser, Routine, Exercise, AnalysisHistoryItem } from '@/types/index';
import axiosInstance from '../../api/axiosInstance';

/**
 * 특정 사용자의 프로필 정보를 가져옵니다.
 * @param userId - 사용자 ID
 */
export const fetchUserProfile = async (userId: number): Promise<ProfileUser> => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('사용자 프로필을 불러오는 데 실패했습니다.');
  }
};

/**
 * 특정 사용자의 모든 루틴 목록을 가져옵니다.
 * @param userId - 사용자 ID
 */
export const fetchUserRoutines = async (userId: number): Promise<Routine[]> => {
  try {
    const response = await axiosInstance.get(`/routines/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('사용자 루틴을 불러오는 데 실패했습니다.');
  }
};

/**
 * 특정 사용자의 모든 분석 기록을 가져옵니다.
 * @param userId - 사용자 ID
 */
export const fetchUserAnalysisHistory = async (userId: number): Promise<AnalysisHistoryItem[]> => {
  try {
    const response = await axiosInstance.get(`/analysis-histories/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('분석 기록을 불러오는 데 실패했습니다.');
  }
};

/**
 * 특정 사용자가 좋아요한 모든 운동의 상세 정보 목록을 가져옵니다.
 * (좋아요 ID 목록 조회 → 각 운동 상세 정보 조회 과정을 포함)
 * @param userId - 사용자 ID
 */
export const fetchFullLikedExercises = async (userId: number): Promise<Exercise[]> => {
  try {
    // 1. 사용자가 좋아요한 운동 관계 목록을 가져옵니다.
    const likedRelationsResponse = await axiosInstance.get(`/exercise-likes/user/${userId}`);
    const likedRelations = likedRelationsResponse.data;

    if (!likedRelations || likedRelations.length === 0) {
      return []; // 좋아요한 운동이 없으면 빈 배열 반환
    }

    // 2. 각 운동의 상세 정보를 병렬로 가져옵니다.
    const exerciseDetailsPromises = likedRelations.map((like: { exerciseId: number }) =>
      axiosInstance.get(`/exercises/${like.exerciseId}`).then(response => response.data)
    );

    return Promise.all(exerciseDetailsPromises);
  } catch (error) {
    throw new Error('좋아요한 운동 목록을 불러오는 데 실패했습니다.');
  }
};