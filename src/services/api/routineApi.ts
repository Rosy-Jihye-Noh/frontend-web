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
  return fetch(`${API_BASE_URL}/routines/${routineId}`)
    .then(res => {
      // 응답이 404 Not Found일 경우, 특정 에러를 발생시킵니다.
      if (res.status === 404) {
        throw new Error('Not Found');
      }
      if (!res.ok) {
        throw new Error('루틴 정보를 불러오는 데 실패했습니다.');
      }
      return res.json();
    });
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

/**
 * 루틴에 운동을 추가합니다.
 * @param routineId - 루틴 ID
 * @param exerciseId - 운동 ID
 */
export const addExerciseToRoutineApi = (routineId: number, exerciseId: number): Promise<void> => {
  return fetch(`${API_BASE_URL}/routines/${routineId}/exercises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ exerciseId }),
  }).then(response => {
    if (!response.ok) {
      throw new Error('운동 추가 실패');
    }
  });
};

/**
 * @description 특정 사용자의 모든 루틴 목록을 조회합니다.
 * @param userId 사용자 ID
 * @returns 사용자의 루틴 목록
 */
export const getRoutinesByUser = async (userId: number): Promise<Routine[]> => {
  const response = await fetch(`${API_BASE_URL}/routines/user/${userId}`);
  if (!response.ok) {
    throw new Error('루틴 목록을 불러오는 데 실패했습니다.');
  }
  
  const routines = await response.json();
  
  // 클라이언트 사이드 보안 검증: 모든 루틴이 요청한 사용자 소유인지 확인
  const validRoutines = routines.filter((routine: Routine) => {
    if (routine.userId !== userId) {
      console.error(`보안 위험: API에서 다른 사용자의 루틴 반환됨 - routineId=${routine.id}, routineUserId=${routine.userId}, requestedUserId=${userId}`);
      return false;
    }
    return true;
  });
  
  if (validRoutines.length !== routines.length) {
    console.error(`보안 검증 실패: ${routines.length - validRoutines.length}개의 잘못된 루틴 필터링됨`);
  }
  
  return validRoutines;
};