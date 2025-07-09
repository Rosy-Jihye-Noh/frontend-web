import type { Exercise } from '../../types/index'; // 'Exercise' 타입 정의 임포트
import axiosInstance from '../../api/axiosInstance'; // 설정된 Axios 인스턴스 임포트

/**
 * 모든 운동 목록을 서버에서 가져옵니다.
 * @returns {Promise<Exercise[]>} 모든 운동 객체의 배열을 포함하는 Promise
 * @throws {Error} 운동 목록을 불러오는 데 실패했을 경우 오류를 발생시킵니다.
 */
export const fetchAllExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await axiosInstance.get('/exercises'); // '/exercises' 엔드포인트로 GET 요청
    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error("fetchAllExercises 실패:", error); // 오류 로깅
    throw new Error('운동 목록을 불러오는 데 실패했습니다.'); // 사용자 정의 오류 메시지 throw
  }
};

/**
 * 특정 사용자가 '좋아요'한 운동 목록을 가져옵니다.
 * @param userId - 좋아요 목록을 조회할 사용자의 ID
 * @returns {Promise<any[]>} 사용자가 좋아요한 운동 정보를 포함하는 배열 (예: { exerciseId: number } 객체들의 배열)을 포함하는 Promise
 * @throws {Error} 사용자 좋아요 목록을 불러오는 데 실패했을 경우 오류를 발생시킵니다.
 */
export const fetchUserLikes = async (userId: number): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(`/exercise-likes/user/${userId}`); // 특정 userId의 좋아요 목록을 조회하는 GET 요청
    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error("fetchUserLikes 실패:", error); // 오류 로깅
    throw new Error('사용자 좋아요 목록을 불러오는 데 실패했습니다.'); // 사용자 정의 오류 메시지 throw
  }
};

/**
 * 특정 사용자가 생성한 루틴 목록을 가져옵니다.
 * @param userId - 루틴 목록을 조회할 사용자의 ID
 * @returns {Promise<any[]>} 사용자가 생성한 루틴 객체들의 배열을 포함하는 Promise
 * @throws {Error} 사용자 루틴을 불러오는 데 실패했을 경우 오류를 발생시킵니다.
 */
export const fetchUserRoutines = async (userId: number): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(`/routines/user/${userId}`); // 특정 userId의 루틴 목록을 조회하는 GET 요청
    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error("fetchUserRoutines 실패:", error); // 오류 로깅
    throw new Error('사용자 루틴을 불러오는 데 실패했습니다.'); // 사용자 정의 오류 메시지 throw
  }
};

/**
 * 특정 운동에 대해 '좋아요'를 추가합니다.
 * @param userId - '좋아요'를 추가할 사용자의 ID
 * @param exerciseId - '좋아요'를 추가할 운동의 ID
 * @returns {Promise<any>} API 응답 데이터를 포함하는 Promise
 * @throws {Error} 좋아요 추가에 실패했을 경우 오류를 발생시킵니다.
 */
export const addLikeApi = async (userId: number, exerciseId: number): Promise<any> => {
  try {
    return await axiosInstance.post('/exercise-likes', { userId, exerciseId }); // '좋아요' 추가를 위한 POST 요청
  } catch (error) {
    console.error("addLikeApi 실패:", error); // 오류 로깅
    throw new Error('좋아요 추가에 실패했습니다.'); // 사용자 정의 오류 메시지 throw
  }
};

/**
 * 특정 운동에 대해 '좋아요'를 제거합니다.
 * @param userId - '좋아요'를 제거할 사용자의 ID
 * @param exerciseId - '좋아요'를 제거할 운동의 ID
 * @returns {Promise<any>} API 응답 데이터를 포함하는 Promise
 * @throws {Error} 좋아요 제거에 실패했을 경우 오류를 발생시킵니다.
 */
export const removeLikeApi = async (userId: number, exerciseId: number): Promise<any> => {
  try {
    // '좋아요' 제거를 위한 DELETE 요청. 쿼리 파라미터를 사용하여 userId와 exerciseId를 전달합니다.
    return await axiosInstance.delete(`/exercise-likes?userId=${userId}&exerciseId=${exerciseId}`);
  } catch (error) {
    console.error("removeLikeApi 실패:", error); // 오류 로깅
    throw new Error('좋아요 제거에 실패했습니다.'); // 사용자 정의 오류 메시지 throw
  }
};

/**
 * 특정 루틴에 운동을 추가합니다.
 * @param routineId - 운동을 추가할 루틴의 ID
 * @param exerciseId - 루틴에 추가할 운동의 ID
 * @returns {Promise<any>} API 응답 데이터를 포함하는 Promise
 * @throws {Error} 운동을 루틴에 추가하는 데 실패했을 경우 오류를 발생시킵니다.
 */
export const addExerciseToRoutineApi = async (routineId: number, exerciseId: number): Promise<any> => {
  try {
    // 루틴에 운동 추가를 위한 POST 요청. 요청 본문에 exerciseId를 포함합니다.
    return await axiosInstance.post(`/routines/${routineId}/exercises`, { exerciseId });
  } catch (error) {
    console.error("addExerciseToRoutineApi 실패:", error); // 오류 로깅
    throw new Error('운동을 루틴에 추가하는 데 실패했습니다.'); // 사용자 정의 오류 메시지 throw
  }
};

/**
 * ID로 특정 운동의 상세 정보를 서버에서 가져옵니다.
 * @param exerciseId - 상세 정보를 가져올 운동의 ID
 * @returns {Promise<Exercise>} 운동 객체의 상세 정보를 포함하는 Promise
 * @throws {Error} 운동 정보를 불러오는 데 실패했을 경우 오류를 발생시킵니다.
 */
export const fetchExerciseById = async (exerciseId: number): Promise<Exercise> => {
  try {
    const response = await axiosInstance.get(`/exercises/${exerciseId}`); // 특정 exerciseId로 GET 요청
    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error("fetchExerciseById 실패:", error); // 오류 로깅
    throw new Error('운동 정보를 불러오는 데 실패했습니다.'); // 사용자 정의 오류 메시지 throw
  }
};

/**
 * 특정 운동의 전체 좋아요 수를 서버에서 가져옵니다.
 * @param exerciseId - 좋아요 수를 조회할 운동의 ID
 * @returns {Promise<{ likeCount: number }>} 좋아요 수를 포함하는 객체 ({ likeCount: 숫자 })를 포함하는 Promise
 * @throws {Error} 좋아요 수를 불러오는 데 실패했을 경우 오류를 발생시킵니다.
 */
export const fetchExerciseLikeCount = async (exerciseId: number): Promise<{ likeCount: number }> => {
  try {
    // 운동 상세 정보와 통계(좋아요 수 포함)를 가져오는 GET 요청
    const response = await axiosInstance.get(`/exercises/${exerciseId}/with-stats`);
    // API 응답 데이터 (likeCount 필드를 포함)를 반환
    return response.data; 
  } catch (error) {
    console.error("fetchExerciseLikeCount 실패:", error); // 오류 로깅
    throw new Error('좋아요 수를 불러오는 데 실패했습니다.'); // 사용자 정의 오류 메시지 throw
  }
};

/**
 * '좋아요' 수가 많은 인기 운동 목록을 서버에서 가져옵니다.
 * @param limit - 가져올 운동 개수 (기본값: 5). 지정하지 않으면 5개의 운동이 반환됩니다.
 * @returns {Promise<(Exercise & { likeCount: number })[]>} 운동 객체와 해당 운동의 'likeCount'를 포함하는 배열을 Promise로 반환합니다.
 * 오류 발생 시 빈 배열을 반환합니다.
 */
export const fetchPopularExercisesByLikes = async (limit: number = 5): Promise<(Exercise & { likeCount: number })[]> => {
  try {
    const response = await axiosInstance.get(`/exercises/popular/likes?limit=${limit}`); // '좋아요' 순 인기 운동 조회
    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error('fetchPopularExercisesByLikes 실패:', error); // 오류 로깅
    // API 호출 실패 시 빈 배열 반환하여 UI에서 안정적으로 처리할 수 있도록 합니다.
    return []; 
  }
};

/**
 * 루틴에 많이 추가된 인기 운동 목록을 서버에서 가져옵니다.
 * @param limit - 가져올 운동 개수 (기본값: 5). 지정하지 않으면 5개의 운동이 반환됩니다.
 * @returns {Promise<(Exercise & { routineCount: number })[]>} 운동 객체와 해당 운동이 루틴에 추가된 횟수('routineCount')를 포함하는 배열을 Promise로 반환합니다.
 * 오류 발생 시 빈 배열을 반환합니다.
 */
export const fetchPopularExercisesByRoutineAdditions = async (limit: number = 5): Promise<(Exercise & { routineCount: number })[]> => {
  try {
    const response = await axiosInstance.get(`/exercises/popular/routines?limit=${limit}`); // 루틴 추가 횟수 순 인기 운동 조회
    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error('fetchPopularExercisesByRoutineAdditions 실패:', error); // 오류 로깅
    // API 호출 실패 시 빈 배열 반환하여 UI에서 안정적으로 처리할 수 있도록 합니다.
    return []; 
  }
};