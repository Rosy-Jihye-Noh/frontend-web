import type { Exercise } from '../../types/index';
import type { RecommendationPayload, RecommendationResponse } from '@/types/recommendation';
import axiosInstance from '../../api/axiosInstance';

/**
 * 모든 운동 목록을 서버에서 가져옵니다.
 * @returns {Promise<Exercise[]>} 모든 운동 객체의 배열을 포함하는 Promise
 * @throws {Error} 운동 목록을 불러오는 데 실패했을 경우 오류를 발생시킵니다.
 */
export const fetchAllExercises = async () => {
  try {
    const response = await axiosInstance.get('/exercises');
    return response.data;
  } catch (error) {
    throw new Error('운동 목록을 불러오는 데 실패했습니다.');
  }
};

/**
 * 특정 사용자가 '좋아요'한 운동 목록을 가져옵니다.
 * @param userId - 좋아요 목록을 조회할 사용자의 ID
 * @returns {Promise<any[]>} 사용자가 좋아요한 운동 정보를 포함하는 배열 (예: { exerciseId: number } 객체들의 배열)을 포함하는 Promise
 * @throws {Error} 사용자 좋아요 목록을 불러오는 데 실패했을 경우 오류를 발생시킵니다.
 */
export const fetchUserLikes = async (userId: number) => {
  try {
    const response = await axiosInstance.get(`/exercise-likes/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('사용자 좋아요 목록을 불러오는 데 실패했습니다.');
  }
};

/**
 * 특정 사용자가 생성한 루틴 목록을 가져옵니다.
 * @param userId - 루틴 목록을 조회할 사용자의 ID
 * @returns {Promise<any[]>} 사용자가 생성한 루틴 객체들의 배열을 포함하는 Promise
 * @throws {Error} 사용자 루틴을 불러오는 데 실패했을 경우 오류를 발생시킵니다.
 */
export const fetchUserRoutines = async (userId: number) => {
  try {
    const response = await axiosInstance.get(`/routines/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('사용자 루틴을 불러오는 데 실패했습니다.');
  }
};

/**
 * 특정 운동에 대해 '좋아요'를 추가합니다.
 * @param userId - '좋아요'를 추가할 사용자의 ID
 * @param exerciseId - '좋아요'를 추가할 운동의 ID
 * @returns {Promise<any>} API 응답 데이터를 포함하는 Promise
 * @throws {Error} 좋아요 추가에 실패했을 경우 오류를 발생시킵니다.
 */
export const addLikeApi = async (userId: number, exerciseId: number) => {
  try {
    return await axiosInstance.post('/exercise-likes', { userId, exerciseId });
  } catch (error) {
    throw new Error('좋아요 추가에 실패했습니다.');
  }
};

/**
 * 특정 운동에 대해 '좋아요'를 제거합니다.
 * @param userId - '좋아요'를 제거할 사용자의 ID
 * @param exerciseId - '좋아요'를 제거할 운동의 ID
 * @returns {Promise<any>} API 응답 데이터를 포함하는 Promise
 * @throws {Error} 좋아요 제거에 실패했을 경우 오류를 발생시킵니다.
 */
export const removeLikeApi = async (userId: number, exerciseId: number) => {
  try {
    return await axiosInstance.delete(`/exercise-likes?userId=${userId}&exerciseId=${exerciseId}`);
  } catch (error) {
    throw new Error('좋아요 제거에 실패했습니다.');
  }
};

/**
 * 특정 루틴에 운동을 추가합니다.
 * @param routineId - 운동을 추가할 루틴의 ID
 * @param exerciseId - 루틴에 추가할 운동의 ID
 * @returns {Promise<any>} API 응답 데이터를 포함하는 Promise
 * @throws {Error} 운동을 루틴에 추가하는 데 실패했을 경우 오류를 발생시킵니다.
 */
export const addExerciseToRoutineApi = async (routineId: number, exerciseId: number) => {
  try {
    return await axiosInstance.post(`/routines/${routineId}/exercises`, { exerciseId });
  } catch (error) {
    throw new Error('운동을 루틴에 추가하는 데 실패했습니다.');
  }
};

/**
 * ID로 특정 운동의 상세 정보를 가져옵니다.
 * @param exerciseId - 운동 ID
 */
export const fetchExerciseById = async (exerciseId: number): Promise<Exercise> => {
  try {
    const response = await axiosInstance.get(`/exercises/${exerciseId}`);
    return response.data;
  } catch (error) {
    throw new Error('운동 정보를 불러오는 데 실패했습니다.');
  }
};

/**
 * 운동의 전체 좋아요 수를 가져옵니다.
 * @param exerciseId - 운동 ID
 */
export const fetchExerciseLikeCount = async (exerciseId: number): Promise<{ likeCount: number }> => {
  try {
    const response = await axiosInstance.get(`/exercises/${exerciseId}/with-stats`);
    return response.data;
  } catch (error) {
    throw new Error('좋아요 수를 불러오는 데 실패했습니다.');
  }
};

/**
 * 좋아요가 많은 인기 운동을 가져옵니다.
 * @param limit - 가져올 운동 개수 (기본값: 5)
 */
export const fetchPopularExercisesByLikes = async (limit: number = 5): Promise<(Exercise & { likeCount: number })[]> => {
  try {
    const response = await axiosInstance.get(`/exercises/popular/likes?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('fetchPopularExercisesByLikes 실패:', error);
    // 에러 시 빈 배열 반환
    return [];
  }
};

/**
 * 루틴에 많이 추가된 인기 운동을 가져옵니다.
 * @param limit - 가져올 운동 개수 (기본값: 5)
 */
export const fetchPopularExercisesByRoutineAdditions = async (limit: number = 5): Promise<(Exercise & { routineCount: number })[]> => {
  try {
    const response = await axiosInstance.get(`/exercises/popular/routines?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('fetchPopularExercisesByRoutineAdditions 실패:', error);
    // 에러 시 빈 배열 반환
    return [];
  }
};

/**
 * 정확히 일치하는 운동명으로 운동을 조회합니다.
 * @param name - 운동명
 * @returns {Promise<Exercise|null>} 운동 객체 또는 null(없을 때)
 */
export const fetchExerciseByExactName = async (name: string): Promise<Exercise | null> => {
  try {
    const response = await axiosInstance.get(`/exercises/search/exact`, { params: { name } });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error('정확히 일치하는 운동명을 조회하는 데 실패했습니다.');
  }
};

// AI 운동 추천을 요청하는 API 함수
export const fetchExerciseRecommendations = async (
  payload: RecommendationPayload
): Promise<RecommendationResponse> => {
  try {
    const response = await axiosInstance.post('/exercises/recommend-exercises', payload);
    return response.data;
  } catch (error) {
    console.error("AI 운동 추천 API 호출 실패:", error);
    // 에러 발생 시 기본 응답 형태를 반환하여 앱의 비정상 종료를 방지
    return {
      message: "AI 추천을 가져오는 데 실패했습니다.",
      recommendations: [],
      reason: "서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    };
  }
};