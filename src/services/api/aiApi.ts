import axiosInstance from '@/api/axiosInstance';
import type { ExerciseLog } from '@/types/index';

interface GoalDetail {
  workouts: number;
  completion_rate: number;
}

export type AiGoalResponse = {
  user_id: number;
  analysis_result: string;
  final_goals: {
    weekly_goal: {
      workouts: number;
      completion_rate: number;
    };
    monthly_goal: {
      workouts: number;
      completion_rate: number;
    };
  };
  generated_badge?: {
    badge_name?: string;
    badge_description?: string;
  };
};

/**
 * AI 목표 추천을 서버에 요청합니다.
 * @param exerciseHistory 사용자의 전체 운동 기록
 * @param persona 사용자가 선택한 AI 코치 페르소나
 * @returns AI가 생성한 목표 추천 결과
 */
export const generateAiGoal = async (
  exerciseHistory: ExerciseLog[],
  // persona를 필수 인자로
  persona: string
): Promise<AiGoalResponse> => {
  try {
    const response = await axiosInstance.post('/ai/generate-goal', {
      exercise_history: exerciseHistory,
      coach_persona: persona,
    });
    return response.data;
  } catch (error) {
    console.error("AI 목표 추천 API 호출 실패:", error);
    throw new Error("AI 목표 추천을 받는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};