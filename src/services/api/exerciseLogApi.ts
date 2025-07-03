import axios from 'axios';
import type { ExerciseLog } from '../../types/index'; // 1번에서 만든 타입


const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api/logs', // Controller의 @RequestMapping("/api/exercise-logs")
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * @description 사용자 ID와 날짜로 운동 기록 조회
 * @param userId 사용자 ID
 * @param date 'YYYY-MM-DD' 형식의 날짜 문자열
 */
export const getLogsByUserAndDate = async (userId: number, date: string): Promise<ExerciseLog[]> => {
  const response = await apiClient.get(`/user/${userId}/date`, {
    params: { dateStr: date }, // BE의 @RequestParam("date")와 이름 일치
  });
  return response.data;
};

/**
 * @description 새로운 운동 기록 생성
 * @param logData 생성할 운동 기록 데이터
 */
export const createLog = async (logData: ExerciseLog): Promise<number> => {
  const response = await apiClient.post('', logData); // POST /api/exercise-logs
  return response.data; // 생성된 log_id 반환
};

/**
 * @description ID로 운동 기록 삭제
 * @param logId 삭제할 운동 기록 ID
 */
export const deleteLog = async (logId: number): Promise<void> => {
  await apiClient.delete(`/${logId}`); // DELETE /api/exercise-logs/{id}
};

/**
 * @description 사용자 ID로 모든 운동 기록 조회
 * @param userId 사용자 ID
 */
export const getLogsByUser = async (userId: number): Promise<ExerciseLog[]> => {
    const response = await apiClient.get(`/user/${userId}`); // GET /api/exercise-logs/user/{userId}
    return response.data;
}

/**
 * @description 기존 운동 기록의 달성률 등을 수정합니다. (PATCH /api/logs/{id})
 * @param logId 수정할 운동 기록의 ID
 * @param logData 수정할 데이터 (e.g., completionRate)
 */
export const updateLog = async (logId: number, logData: Partial<ExerciseLog>): Promise<void> => {
  await apiClient.patch(`/${logId}`, logData);
};