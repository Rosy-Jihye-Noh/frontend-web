import axiosInstance from '@/api/axiosInstance';

// GoalRecommendationPage에서 사용하는 AiGoalResponse의 final_goals 타입
interface FinalGoals {
  weekly_goal: {
    workouts: number;
    completion_rate: number;
  };
  monthly_goal: {
    workouts: number;
    completion_rate: number;
  };
}

/**
 * 사용자의 AI 생성 목표를 서버에 저장합니다.
 * @param userId - 목표를 저장할 사용자의 ID
 * @param goals - 저장할 final_goals 객체
 */
export const saveAiGoalsToUser = async (userId: number, goals: FinalGoals): Promise<void> => {
  try {
    // 백엔드의 /api/users/{userId}/goals 엔드포인트에 POST 요청
    await axiosInstance.post(`/users/${userId}/goals`, goals);
  } catch (error) {
    console.error("AI 목표 저장 API 호출 실패:", error);
    throw new Error("AI 목표를 저장하는 데 실패했습니다.");
  }
};