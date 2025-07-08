import type { Routine } from '@/types/index';
import axiosInstance from '../../api/axiosInstance';

/**
 * 새로운 루틴을 생성합니다.
 * @param routineData - 생성할 루틴 데이터
 */
export const createRoutine = async (routineData: Omit<Routine, 'id' | 'userId'>, userId: number): Promise<Routine> => {
  try {
    const response = await axiosInstance.post(`/routines/user/${userId}`, routineData);
    return response.data;
  } catch (error) {
    throw new Error('루틴 생성에 실패했습니다.');
  }
};

/**
 * ID로 특정 루틴의 상세 정보를 가져옵니다.
 * @param routineId - 루틴 ID
 */
export const fetchRoutineById = async (routineId: number): Promise<Routine> => {
  try {
    const response = await axiosInstance.get(`/routines/${routineId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Not Found');
    }
    throw new Error('루틴 정보를 불러오는 데 실패했습니다.');
  }
};

/**
 * ID로 특정 루틴을 삭제합니다.
 * @param routineId - 삭제할 루틴 ID
 */
export const deleteRoutineById = async (routineId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/routines/${routineId}`);
  } catch (error) {
    throw new Error('루틴 삭제 실패');
  }
};

/**
 * ID로 특정 루틴 정보를 수정합니다.
 * @param routineId - 수정할 루틴 ID
 * @param routineData - 수정할 루틴 데이터
 */
export const updateRoutine = async (routineId: number, routineData: Omit<Routine, 'id' | 'userId'>): Promise<Routine> => {
  try {
    const response = await axiosInstance.put(`/routines/${routineId}`, routineData);
    return response.data;
  } catch (error) {
    throw new Error('루틴 수정에 실패했습니다.');
  }
};

/**
 * 루틴에 운동을 추가합니다.
 * @param routineId - 루틴 ID
 * @param exerciseId - 운동 ID
 */
export const addExerciseToRoutineApi = async (routineId: number, exerciseId: number): Promise<void> => {
  try {
    await axiosInstance.post(`/routines/${routineId}/exercises`, { exerciseId });
  } catch (error) {
    throw new Error('운동 추가 실패');
  }
};

/**
 * @description 특정 사용자의 모든 루틴 목록을 조회합니다.
 * @param userId 사용자 ID
 * @returns 사용자의 루틴 목록
 */
export const getRoutinesByUser = async (userId: number): Promise<Routine[]> => {
  try {
    const response = await axiosInstance.get(`/routines/user/${userId}`);
    const routines = response.data;
    
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
  } catch (error) {
    throw new Error('루틴 목록을 불러오는 데 실패했습니다.');
  }
};