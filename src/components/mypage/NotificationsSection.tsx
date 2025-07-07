import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBell, HiChat, HiHeart, HiReply, HiCheck, HiX } from 'react-icons/hi';
import type { Notification } from '@/types/index';

interface NotificationsSectionProps {
  userId: number;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/users/${userId}/notifications`);
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array before setting notifications
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          console.warn('API returned non-array data:', data);
          setNotifications([]);
        }
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`http://localhost:8081/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      if (response.ok) {
        setNotifications(prev => 
          Array.isArray(prev) ? prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          ) : []
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/users/${userId}/notifications/read-all`, {
        method: 'PATCH'
      });
      if (response.ok) {
        setNotifications(prev => 
          Array.isArray(prev) ? prev.map(notif => ({ ...notif, isRead: true })) : []
        );
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`http://localhost:8081/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setNotifications(prev => 
          Array.isArray(prev) ? prev.filter(notif => notif.id !== notificationId) : []
        );
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'COMMENT':
        return <HiChat className="w-5 h-5 text-blue-500" />;
      case 'LIKE':
        return <HiHeart className="w-5 h-5 text-red-500" />;
      case 'REPLY':
        return <HiReply className="w-5 h-5 text-green-500" />;
      default:
        return <HiBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}일 전`;
    } else if (hours > 0) {
      return `${hours}시간 전`;
    } else {
      return '방금 전';
    }
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter(notif => !notif.isRead).length : 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.postId) {
      navigate(`/community/${notification.postId}`);
    }
  };

  return (
            <div className="bg-card rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">알림</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <HiCheck className="w-4 h-4" />
            모두 읽음
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2"></div>
            <p>로딩 중...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {!Array.isArray(notifications) || notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <HiBell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-500" />
              <p>새로운 알림이 없습니다.</p>
            </div>
          ) : (
            notifications
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer group ${
                    notification.isRead 
                      ? 'border-border bg-card hover:border-border' 
                      : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`font-semibold text-sm ${
                          notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-blue-800 dark:text-blue-300'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatDate(notification.createdAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-sm ${
                        notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-blue-700 dark:text-blue-400'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.postTitle && (
                        <p className="text-xs text-blue-500 mt-1">
                          "{notification.postTitle}"
                        </p>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
