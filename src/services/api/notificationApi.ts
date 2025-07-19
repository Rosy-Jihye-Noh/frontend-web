import axiosInstance from '@/api/axiosInstance';

export const fetchNotifications = async (userId: number) => {
  const response = await axiosInstance.get(`/users/${userId}/notifications`);
  return response.data;
};

export const markNotificationAsRead = async (userId: number, notificationId: number) => {
  const response = await axiosInstance.put(`/users/${userId}/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (userId: number) => {
  const response = await axiosInstance.put(`/users/${userId}/notifications/read-all`);
  return response.data;
};

export const deleteNotification = async (userId: number, notificationId: number) => {
  const response = await axiosInstance.delete(`/users/${userId}/notifications/${notificationId}`);
  return response.data;
};

/**
 * 사용자에게 뱃지를 수여합니다.
 * @param userId - 사용자 ID
 * @param badgeName - 뱃지 이름
 * @param badgeDescription - 뱃지 설명
 */
export const awardBadgeToUser = async (
  userId: number,
  badgeName: string,
  badgeDescription: string
): Promise<void> => {
  try {
    await axiosInstance.post(`/achievements/${userId}`, {
      badge_name: badgeName,
      badge_description: badgeDescription,
    });
  } catch (error) {
    console.error("뱃지 수여 API 호출 실패:", error);
    throw new Error("뱃지 수여에 실패했습니다.");
  }
};