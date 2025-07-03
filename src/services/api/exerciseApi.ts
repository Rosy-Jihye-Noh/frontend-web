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