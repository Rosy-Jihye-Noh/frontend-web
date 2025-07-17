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