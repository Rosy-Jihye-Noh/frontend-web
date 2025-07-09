import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBell, HiChat, HiHeart, HiReply, HiCheck, HiX } from 'react-icons/hi';
import type { Notification } from '@/types/index';
import axiosInstance from '@/api/axiosInstance';

// NotificationsSection 컴포넌트의 props 인터페이스
interface NotificationsSectionProps {
  userId: number; // 현재 로그인된 사용자 ID
}

// NotificationsSection 함수형 컴포넌트 정의
const NotificationsSection: React.FC<NotificationsSectionProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- API 호출 및 상태 관리 함수 ---

  /**
   * 서버에서 알림 목록을 비동기적으로 불러오는 함수입니다.
   */
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // 지정된 userId의 알림을 가져오는 API 요청
      const response = await axiosInstance.get(`/users/${userId}/notifications`);
      
      // HTTP 상태 코드가 200 (성공)인 경우
      if (response.status === 200) {
        const data = response.data;
        console.log('Notifications API Response:', data);

        // 서버 응답 형태에 따라 데이터를 클라이언트 Notification 타입에 맞게 변환
        if (data && Array.isArray(data.content)) {
          const transformedNotifications = data.content.map((notif: any) => ({
            ...notif,
            postId: notif.referenceId, // 'referenceId'를 'postId'로 매핑
            isRead: notif.read, // 'read'를 'isRead'로 매핑
          }));
          setNotifications(transformedNotifications); // 변환된 알림 목록으로 상태 업데이트
        } else if (data && Array.isArray(data)) {
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
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  // 컴포넌트 마운트 시 또는 userId가 유효하게 변경될 때 알림을 불러옵니다.
  useEffect(() => {
    if (userId && userId > 0) {
      fetchNotifications();
    }
  }, [userId]);

  /**
   * 특정 알림을 '읽음' 상태로 표시하는 비동기 함수입니다.
   * @param notificationId - 읽음 처리할 알림의 ID
   */
  const markAsRead = async (notificationId: number) => {
    // 이미 읽은 알림이면 불필요한 API 호출을 방지하기 위해 함수 종료
    const targetNotif = notifications.find(n => n.id === notificationId);
    if (targetNotif?.isRead) return;

    // 낙관적 UI 업데이트: API 호출이 완료되기 전에 UI를 먼저 업데이트하여 사용자 경험 향상
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif // 해당 알림의 isRead를 true로 변경
      )
    );

    try {
      // 서버에 알림 읽음 처리 요청 (PUT 요청)
      const response = await axiosInstance.put(`/users/${userId}/notifications/${notificationId}/read`);

      if (response.status === 200) {
        console.log(`알림 ${notificationId} 읽음 처리 완료`);
      } else {
        // API 요청 실패 시 에러 발생
        throw new Error(`Failed to mark as read: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // 에러 발생 시 낙관적 업데이트를 롤백하여 UI를 원래 상태로 되돌림
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: false } : notif // isRead를 false로 롤백
        )
      );
    }
  };

  /**
   * 모든 읽지 않은 알림을 '읽음' 상태로 표시하는 비동기 함수입니다.
   */
  const markAllAsRead = async () => {
    // 읽지 않은 알림이 없으면 함수 실행 중단
    const unreadNotifications = notifications.filter(notif => !notif.isRead);
    if (unreadNotifications.length === 0) return;

    // 낙관적 UI 업데이트: 모든 알림의 isRead를 true로 변경
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    
    try {
      // 서버에 모든 알림 읽음 처리 요청 (PUT 요청)
      const response = await axiosInstance.put(`/users/${userId}/notifications/read-all`);

      if (response.status === 200) {
        console.log('모든 알림 읽음 처리 완료');
      } else {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      fetchNotifications();
    }
  };

  /**
   * 특정 알림을 삭제하는 비동기 함수입니다.
   * @param notificationId - 삭제할 알림의 ID
   */
  const deleteNotification = async (notificationId: number) => {
    // 삭제 전 현재 알림 목록을 백업하여 실패 시 롤백에 사용
    const originalNotifications = notifications;
    // 낙관적 UI 업데이트: 해당 알림을 목록에서 즉시 제거
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

    try {
      // 서버에 알림 삭제 요청 (DELETE 요청)
      const response = await axiosInstance.delete(`/users/${userId}/notifications/${notificationId}`);

      if (response.status === 200) {
        console.log(`알림 ${notificationId} 삭제 완료`);
      } else {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setNotifications(originalNotifications); // 에러 발생 시 백업해둔 원래 목록으로 롤백
    }
  };

  /**
   * 알림 클릭 시 호출되는 핸들러입니다. 알림을 읽음 처리하고, 해당 게시글 페이지로 이동합니다.
   * @param notification - 클릭된 알림 객체
   */
  const handleNotificationClick = async (notification: Notification) => {
    console.log('알림 클릭됨:', notification);

    try {
      // 알림이 읽지 않은 상태이면 먼저 읽음 처리 요청 
      // (비동기로 진행되므로 페이지 이동과 동시에 실행)
      if (!notification.isRead) {
        markAsRead(notification.id);
      }

      // 알림에 연결된 postId가 유효한 경우에만 해당 커뮤니티 게시글 페이지로 이동
      if (notification.postId && notification.postId > 0) {
        console.log(`페이지 이동: /community/${notification.postId}`);
        navigate(`/community/${notification.postId}`);
      } else {
        console.warn('이 알림에는 연결된 게시글(postId)이 없습니다:', notification);
        // postId가 없어도 알림 읽음 처리는 완료됩니다.
      }
    } catch (error) {
      console.error('알림 클릭 처리 중 오류:', error);
    }
  };

  // --- 헬퍼 함수 및 렌더링 관련 변수 ---

  /**
   * 알림 타입에 따라 적절한 아이콘 컴포넌트를 반환합니다.
   * @param type - 알림 타입 ('POST_COMMENT', 'POST_LIKE', 'COMMENT_REPLY' 등)
   * @returns {JSX.Element} 해당 타입에 맞는 아이콘 컴포넌트
   */
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

  /**
   * 날짜 문자열을 "N일 전", "N시간 전", "N분 전", "방금 전"과 같은 상대적인 시간 형식으로 포맷팅합니다.
   * @param dateString - ISO 8601 형식의 날짜 문자열
   * @returns {string} 포맷팅된 시간 문자열
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString); // 알림 생성 날짜
    const now = new Date();             // 현재 시간
    
    const diff = now.getTime() - date.getTime(); // 두 날짜 간의 시간 차이 (밀리초)
    const hours = Math.floor(diff / (1000 * 60 * 60)); // 시간 차이 (시간 단위)
    const days = Math.floor(hours / 24); // 시간 차이 (일 단위)
    
    if (days > 0) return `${days}일 전`;       // 1일 이상 차이
    if (hours > 0) return `${hours}시간 전`;   // 1시간 이상 차이
    
    const minutes = Math.floor(diff / (1000 * 60)); // 분 차이
    if (minutes > 0) return `${minutes}분 전`; // 1분 이상 차이
    
    return '방금 전'; // 1분 미만 차이
  };

  // 읽지 않은 알림의 개수 계산
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // 컴포넌트 렌더링
  return (
    <div className="bg-card rounded-xl shadow-lg p-6"> {/* 알림 섹션 전체 컨테이너 */}
      {/* 헤더 부분 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">알림</h2> {/* 제목 */}
          {unreadCount > 0 && (
            // 읽지 않은 알림이 있을 경우 개수를 표시하는 뱃지
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          // 읽지 않은 알림이 있을 경우 '모두 읽음' 버튼 표시
          <button 
            onClick={markAllAsRead} // 모든 알림 읽음 처리 함수 호출
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <HiCheck className="w-4 h-4" /> {/* 체크 아이콘 */}
            모두 읽음
          </button>
        )}
      </div>

      {/* 알림 목록 */}
      {isLoading ? (
        // 로딩 중일 때 표시되는 메시지
        <div className="text-center py-12"><p>로딩 중...</p></div>
      ) : (
        <div className="space-y-2"> {/* 알림 항목들 간의 세로 간격 */}
          {notifications.length === 0 ? (
            // 알림이 없을 때 표시되는 메시지
            <div className="text-center py-12 text-gray-500">
              <HiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" /> {/* 큰 알림 아이콘 */}
              <p>새로운 알림이 없습니다.</p>
            </div>
          ) : (
            // 알림이 있을 경우: 최신 순으로 정렬하여 표시
            notifications
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // `createdAt`을 기준으로 내림차순 정렬
              .map((notification) => (
                <div
                  key={notification.id} // 알림 고유 ID를 키로 사용
                  className={`relative p-4 rounded-lg border transition-all duration-200 group cursor-pointer ${
                    notification.isRead
                      ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' // 읽음 상태 스타일
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300' // 안읽은 상태 스타일 (파란색 배경)
                  }`}
                  onClick={() => handleNotificationClick(notification)} // 알림 클릭 핸들러
                >
                  <div className="flex items-start gap-4">
                    {/* 읽지 않은 알림을 시각적으로 표시하는 작은 파란색 점 */}
                    {!notification.isRead && (
                      <div className="absolute top-4 left-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    
                    {/* 알림 타입에 따른 아이콘 */}
                    <div className="flex-shrink-0 mt-1 ml-2">{getIcon(notification.type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      {/* 알림 메시지 */}
                      <p className={`font-medium text-sm leading-relaxed ${
                        notification.isRead ? 'text-gray-600' : 'text-gray-900' // 읽음/안읽음 상태에 따른 텍스트 색상
                      }`}>
                        {notification.message}
                      </p>
                      
                      {/* 게시글 제목 (있을 경우) */}
                      {notification.postTitle && (
                        <p className={`text-xs mt-1 truncate ${ // 제목이 길면 생략
                          notification.isRead ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          게시글: "{notification.postTitle}"
                        </p>
                      )}
                      
                      {/* 알림 생성 시간 (상대 시간으로 포맷팅) */}
                      <span className={`text-xs mt-2 block ${
                        notification.isRead ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* 알림에 마우스를 올렸을 때 나타나는 버튼 그룹 (읽음 처리, 삭제) */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {!notification.isRead && (
                      // 읽지 않은 알림일 경우 '읽음 처리' 버튼 표시
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 부모 요소의 onClick 이벤트(알림 클릭) 전파 방지
                          markAsRead(notification.id); // 읽음 처리 함수 호출
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-green-600 transition-colors"
                        title="읽음 처리" // 툴팁
                        aria-label="읽음 처리" // 접근성 레이블
                      >
                        <HiCheck className="w-4 h-4" /> {/* 체크 아이콘 */}
                      </button>
                    )}
                    {/* 알림 삭제 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 부모 요소의 onClick 이벤트 전파 방지
                        deleteNotification(notification.id); // 알림 삭제 함수 호출
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors"
                      title="삭제" // 툴팁
                      aria-label="알림 삭제" // 접근성 레이블
                    >
                      <HiX className="w-4 h-4" /> {/* X 아이콘 */}
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

export default NotificationsSection; // 컴포넌트 내보내기