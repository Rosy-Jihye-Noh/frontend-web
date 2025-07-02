import type { ProfileUser, Routine, Exercise, AnalysisHistoryItem } from '@/types/index';

const API_BASE_URL = 'http://localhost:8081/api';

/**
 * API 응답을 처리하는 헬퍼 함수
 * @param response - fetch 응답 객체
 * @returns JSON 파싱된 데이터
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패: ${errorText}`);
  }
  return response.json();
};

/**
 * 특정 사용자의 프로필 정보를 가져옵니다.
 * @param userId - 사용자 ID
 */
export const fetchUserProfile = (userId: number): Promise<ProfileUser> => {
  return fetch(`${API_BASE_URL}/users/${userId}`).then(handleResponse);
};

/**
 * 특정 사용자의 모든 루틴 목록을 가져옵니다.
 * @param userId - 사용자 ID
 */
export const fetchUserRoutines = (userId: number): Promise<Routine[]> => {
  return fetch(`${API_BASE_URL}/routines/user/${userId}`).then(handleResponse);
};

/**
 * 특정 사용자의 모든 분석 기록을 가져옵니다.
 * @param userId - 사용자 ID
 */
export const fetchUserAnalysisHistory = (userId: number): Promise<AnalysisHistoryItem[]> => {
  return fetch(`${API_BASE_URL}/analysis-histories/user/${userId}`).then(handleResponse);
};

/**
 * 특정 사용자가 좋아요한 모든 운동의 상세 정보 목록을 가져옵니다.
 * (좋아요 ID 목록 조회 → 각 운동 상세 정보 조회 과정을 포함)
 * @param userId - 사용자 ID
 */
export const fetchFullLikedExercises = async (userId: number): Promise<Exercise[]> => {
  // 1. 사용자가 좋아요한 운동 관계 목록을 가져옵니다.
  const likedRelations = await fetch(`${API_BASE_URL}/exercise-likes/user/${userId}`).then(handleResponse);

  if (!likedRelations || likedRelations.length === 0) {
    return []; // 좋아요한 운동이 없으면 빈 배열 반환
  }

  // 2. 각 운동의 상세 정보를 병렬로 가져옵니다.
  const exerciseDetailsPromises = likedRelations.map((like: { exerciseId: number }) =>
    fetch(`${API_BASE_URL}/exercises/${like.exerciseId}`).then(handleResponse)
  );

  return Promise.all(exerciseDetailsPromises);
};