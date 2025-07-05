import type { Exercise } from '../../types/index';

export const fetchAllExercises = () => fetch('http://localhost:8081/api/exercises').then(res => res.json());

export const fetchUserLikes = (userId: number) => fetch(`http://localhost:8081/api/exercise-likes/user/${userId}`).then(res => res.json());

export const fetchUserRoutines = (userId: number) => fetch(`http://localhost:8081/api/routines/user/${userId}`).then(res => res.json());

export const addLikeApi = (userId: number, exerciseId: number) => fetch('http://localhost:8081/api/exercise-likes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, exerciseId })
});

export const removeLikeApi = (userId: number, exerciseId: number) => fetch(`http://localhost:8081/api/exercise-likes?userId=${userId}&exerciseId=${exerciseId}`, { method: 'DELETE' });

export const addExerciseToRoutineApi = (routineId: number, exerciseId: number) => fetch(`http://localhost:8081/api/routines/${routineId}/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseId })
});

/**
 * ID로 특정 운동의 상세 정보를 가져옵니다.
 * @param exerciseId - 운동 ID
 */
export const fetchExerciseById = (exerciseId: number): Promise<Exercise> => {
  return fetch(`http://localhost:8081/api/exercises/${exerciseId}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('운동 정보를 불러오는 데 실패했습니다.');
      }
      return res.json();
    });
};

/**
 * 운동의 전체 좋아요 수를 가져옵니다.
 * @param exerciseId - 운동 ID
 */
export const fetchExerciseLikeCount = (exerciseId: number): Promise<{ likeCount: number }> => {
  return fetch(`http://localhost:8081/api/exercises/${exerciseId}/with-stats`)
    .then(res => {
      if (!res.ok) {
        throw new Error('좋아요 수를 불러오는 데 실패했습니다.');
      }
      return res.json();
    });
};

/**
 * 좋아요가 많은 인기 운동을 가져옵니다.
 * @param limit - 가져올 운동 개수 (기본값: 5)
 */
export const fetchPopularExercisesByLikes = async (limit: number = 5): Promise<(Exercise & { likeCount: number })[]> => {
  try {
    const response = await fetch(`http://localhost:8081/api/exercises/popular/likes?limit=${limit}`);
    if (!response.ok) {
      throw new Error('인기 운동을 불러오는 데 실패했습니다.');
    }
    return response.json();
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
    const response = await fetch(`http://localhost:8081/api/exercises/popular/routines?limit=${limit}`);
    if (!response.ok) {
      throw new Error('루틴 인기 운동을 불러오는 데 실패했습니다.');
    }
    return response.json();
  } catch (error) {
    console.error('fetchPopularExercisesByRoutineAdditions 실패:', error);
    // 에러 시 빈 배열 반환
    return [];
  }
};