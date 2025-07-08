import type { Exercise } from '../../types/index';
import axiosInstance from '../../api/axiosInstance';

export const fetchAllExercises = async () => {
  try {
    const response = await axiosInstance.get('/exercises');
    return response.data;
  } catch (error) {
    throw new Error('운동 목록을 불러오는 데 실패했습니다.');
  }
};

export const fetchUserLikes = async (userId: number) => {
  try {
    const response = await axiosInstance.get(`/exercise-likes/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('사용자 좋아요 목록을 불러오는 데 실패했습니다.');
  }
};

export const fetchUserRoutines = async (userId: number) => {
  try {
    const response = await axiosInstance.get(`/routines/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('사용자 루틴을 불러오는 데 실패했습니다.');
  }
};

export const addLikeApi = async (userId: number, exerciseId: number) => {
  try {
    return await axiosInstance.post('/exercise-likes', { userId, exerciseId });
  } catch (error) {
    throw new Error('좋아요 추가에 실패했습니다.');
  }
};

export const removeLikeApi = async (userId: number, exerciseId: number) => {
  try {
    return await axiosInstance.delete(`/exercise-likes?userId=${userId}&exerciseId=${exerciseId}`);
  } catch (error) {
    throw new Error('좋아요 제거에 실패했습니다.');
  }
};

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