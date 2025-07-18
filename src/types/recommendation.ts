import type { Exercise, Routine, ProfileUser, AnalysisHistoryItem, ExerciseLog } from '@/types/index';

// AI 추천 API에 보낼 데이터의 타입
export interface RecommendationPayload {
  /** 사용자의 고유 ID (문자열 형태) */
  user_id: string;

  /** 사용자의 프로필 정보 (키, 몸무게, 목표 등) */
  user_profile: ProfileUser;

  /** 사용자의 최신 체형 분석 데이터 */
  posture_analysis: Partial<AnalysisHistoryItem>;

  /** 사용자의 전체 운동 기록 */
  exercise_history: ExerciseLog[];

  /** 사용자가 '좋아요'를 누른 운동 목록 */
  liked_exercises: Partial<Exercise>[];

  /** 사용자가 생성한 모든 루틴 목록 */
  user_routines: Routine[];
}

// AI 추천 API로부터 받을 응답 데이터의 타입
export interface RecommendationResponse {
  message: string;
  recommendations: Exercise[];
  reason: string;
}