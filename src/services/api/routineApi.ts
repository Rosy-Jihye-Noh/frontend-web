import type { Routine } from '@/types/index';

const API_BASE_URL = 'http://localhost:8081/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패: ${errorText}`);
  }
  return response.json();
};

/**
 * 새로운 루틴을 생성합니다.
 * @param routineData - 생성할 루틴 데이터
 */
export const createRoutine = (routineData: Omit<Routine, 'id' | 'userId'>, userId: number): Promise<Routine> => {
  // URL을 /api/routines/user/{userId} 형태로 변경합니다.
  return fetch(`${API_BASE_URL}/routines/user/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // userId는 URL로 전달되므로 body에서는 제외합니다.
    body: JSON.stringify(routineData),
  }).then(handleResponse);
};

/**
 * ID로 특정 루틴의 상세 정보를 가져옵니다.
 * @param routineId - 루틴 ID
 */
export const fetchRoutineById = (routineId: number): Promise<Routine> => {
  return fetch(`${API_BASE_URL}/routines/${routineId}`).then(handleResponse);
};

/**
 * ID로 특정 루틴을 삭제합니다.
 * @param routineId - 삭제할 루틴 ID
 */
export const deleteRoutineById = (routineId: number): Promise<void> => {
  return fetch(`${API_BASE_URL}/routines/${routineId}`, {
    method: 'DELETE',
  }).then(response => {
    if (!response.ok && response.status !== 204) { // 204 No Content는 성공 응답
      throw new Error('루틴 삭제 실패');
    }
    // NO_CONTENT의 경우 body가 없으므로 json()을 호출하지 않음
  });
};

/**
 * ID로 특정 루틴 정보를 수정합니다.
 * @param routineId - 수정할 루틴 ID
 * @param routineData - 수정할 루틴 데이터
 */
export const updateRoutine = (routineId: number, routineData: Omit<Routine, 'id' | 'userId'>): Promise<Routine> => {
  return fetch(`${API_BASE_URL}/routines/${routineId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(routineData),
  }).then(handleResponse);
};