import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBell, HiChat, HiHeart, HiReply, HiCheck, HiX } from 'react-icons/hi';
import type { Notification } from '@/types/index';
import axiosInstance from '@/api/axiosInstance';

interface NotificationsSectionProps {
  userId: number;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- API 호출 및 상태 관리 함수 ---

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/users/${userId}/notifications`);
      if (response.status === 200) {
        const data = response.data;
        console.log('Notifications API Response:', data); // 디버깅용
        
        if (data && Array.isArray(data.content)) {
          // 서버 응답을 클라이언트 형식으로 변환
          const transformedNotifications = data.content.map((notif: any) => ({
            ...notif,
            postId: notif.referenceId, // referenceId를 postId로 매핑
            isRead: notif.read, // read를 isRead로 매핑
          }));
          setNotifications(transformedNotifications);
        } else if (data && Array.isArray(data)) {
          // content가 없고 직접 배열인 경우
          const transformedNotifications = data.map((notif: any) => ({
            ...notif,
            postId: notif.referenceId,
            isRead: notif.read,
          }));
          setNotifications(transformedNotifications);
        } else {
          setNotifications([]);
        }
      } else {
        console.error('Failed to fetch notifications:', response.status);
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
    if (userId && userId > 0) {
      fetchNotifications();
    }
  }, [userId]);

  const markAsRead = async (notificationId: number) => {
    // 이미 읽은 상태이면 함수를 실행하지 않음
    const targetNotif = notifications.find(n => n.id === notificationId);
    if (targetNotif?.isRead) return;

    // 낙관적 UI 업데이트: API 호출을 기다리지 않고 화면을 먼저 변경
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );

    try {
      const response = await axiosInstance.put(`/users/${userId}/notifications/${notificationId}/read`);

      if (response.status === 200) {
        console.log(`알림 ${notificationId} 읽음 처리 완료`);
      } else {
        throw new Error(`Failed to mark as read: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // 에러 발생 시 원래 상태로 롤백
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: false } : notif
        )
      );
    }
  };

  const markAllAsRead = async () => {
    // 읽지 않은 알림이 없으면 실행하지 않음
    const unreadNotifications = notifications.filter(notif => !notif.isRead);
    if (unreadNotifications.length === 0) return;

    // 낙관적 UI 업데이트
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    
    try {
      const response = await axiosInstance.put(`/users/${userId}/notifications/read-all`);

      if (response.status === 200) {
        console.log('모든 알림 읽음 처리 완료');
      } else {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      fetchNotifications(); // 실패 시 서버 데이터로 다시 동기화
    }
  };

  const deleteNotification = async (notificationId: number) => {
    const originalNotifications = notifications;
    // 낙관적 UI 업데이트
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

    try {
      const response = await axiosInstance.delete(`/users/${userId}/notifications/${notificationId}`);

      if (response.status === 200) {
        console.log(`알림 ${notificationId} 삭제 완료`);
      } else {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setNotifications(originalNotifications); // 실패 시 롤백
    }
  };

  // 클릭 이벤트 핸들러
  const handleNotificationClick = async (notification: Notification) => {
    console.log('알림 클릭됨:', notification); // 디버깅용
    
    try {
      // 클릭 시 먼저 읽음 처리 (비동기로 처리하지만 페이지 이동은 즉시)
      if (!notification.isRead) {
        markAsRead(notification.id);
      }

      // postId가 있는 경우에만 페이지 이동
      if (notification.postId && notification.postId > 0) {
        console.log(`페이지 이동: /community/${notification.postId}`); // 디버깅용
        navigate(`/community/${notification.postId}`);
      } else {
        console.warn('이 알림에는 연결된 게시글(postId)이 없습니다:', notification);
        // postId가 없어도 알림은 읽음 처리됨
      }
    } catch (error) {
      console.error('알림 클릭 처리 중 오류:', error);
    }
  };

  // --- 헬퍼 및 렌더링 변수 ---
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'POST_COMMENT':
      case 'COMMENT': 
        return <HiChat className="w-5 h-5 text-blue-500" />;
      case 'POST_LIKE':
      case 'LIKE': 
        return <HiHeart className="w-5 h-5 text-red-500" />;
      case 'COMMENT_REPLY':
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
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes}분 전`;
    
    return '방금 전';
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      {/* 헤더 부분 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">알림</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead} 
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <HiCheck className="w-4 h-4" />
            모두 읽음
          </button>
        )}
      </div>

      {/* 알림 목록 */}
      {isLoading ? (
        <div className="text-center py-12"><p>로딩 중...</p></div>
      ) : (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <HiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>새로운 알림이 없습니다.</p>
            </div>
          ) : (
            notifications
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 rounded-lg border transition-all duration-200 group cursor-pointer ${
                    notification.isRead
                      ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' // 읽음 상태
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300' // 안읽은 상태
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    {/* 읽지 않은 알림 표시 점 */}
                    {!notification.isRead && (
                      <div className="absolute top-4 left-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    
                    <div className="flex-shrink-0 mt-1 ml-2">{getIcon(notification.type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm leading-relaxed ${
                        notification.isRead ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {notification.message}
                      </p>
                      
                      {notification.postTitle && (
                        <p className={`text-xs mt-1 truncate ${
                          notification.isRead ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          게시글: "{notification.postTitle}"
                        </p>
                      )}
                      
                      <span className={`text-xs mt-2 block ${
                        notification.isRead ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* 마우스 올렸을 때 나타나는 버튼 그룹 */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-green-600 transition-colors"
                        title="읽음 처리"
                        aria-label="읽음 처리"
                      >
                        <HiCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors"
                      title="삭제"
                      aria-label="알림 삭제"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;