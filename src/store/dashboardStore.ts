import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Zustand 미들웨어에서 `persist` (상태 영속화) 임포트
import type { Routine } from '@/types/index'; // 루틴(Routine) 타입 정의 임포트

// 대시보드 상태의 인터페이스
interface DashboardState {
  userRoutines: Record<number, Routine[]>; // 사용자가 선택한 루틴 배열을 저장
  todaySelectedRoutines: Routine[]; //사용자가 오늘 선택한 루틴 목록
  currentUserId: number | null; // 로그인된 사용자의 ID

  // 액션 함수들 정의
  setTodaySelectedRoutines: (routines: Routine[], userId: number) => void; // 오늘 선택된 루틴을 설정하는 함수
  getTodayRoutines: (userId: number) => Routine[]; // 오늘 루틴을 가져오는 함수
  clearUserData: () => void; //모든 사용자 관련 데이터를 초기화하는 함수 (로그아웃)
  setCurrentUser: (userId: number) => void; //현재 로그인된 사용자 ID를 설정하고, 사용자 변경 시 상태를 조정하는 함수
}

// `useDashboardStore` Zustand 스토어 생성
export const useDashboardStore = create<DashboardState>()(
  // `persist` 미들웨어를 사용하여 스토어 상태를 로컬 스토리지에 영속화
  persist(
    (set, get) => ({
      // 초기 상태
      userRoutines: {},
      todaySelectedRoutines: [],
      currentUserId: null,
      
      /**
       * 현재 로그인된 사용자 ID를 설정합니다.
       * 만약 사용자 ID가 변경되면, 이전 사용자의 `todaySelectedRoutines`를 초기화합니다.
       * 이는 여러 사용자가 같은 기기를 사용할 때 데이터 혼동을 방지합니다.
       * @param userId - 새로 설정할 사용자 ID
       */
      setCurrentUser: (userId: number) => {
        const { currentUserId, userRoutines } = get(); // 현재 상태에서 currentUserId와 userRoutines를 가져옴
        
        // 현재 사용자 ID가 새로 들어온 userId와 다르면 (사용자 변경 감지)
        if (currentUserId !== userId) {
          console.log('사용자 변경 감지:', currentUserId, '->', userId);
          set({ 
            currentUserId: userId, // 현재 사용자 ID 업데이트
            // `todaySelectedRoutines`를 빈 배열로 초기화
            // `userRoutines[userId]?.slice(0, 0)`는 해당 사용자의 기존 루틴이 있다면 빈 배열을 생성하고, 없으면 그냥 빈 배열을 사용
            todaySelectedRoutines: userRoutines[userId]?.slice(0, 0) || [] 
          });
        }
      },
      
      /**
       * 특정 사용자의 오늘 선택된 루틴을 설정하고 저장합니다.
       * 이 루틴은 `todaySelectedRoutines`와 `userRoutines`의 해당 사용자 항목에 저장됩니다.
       * @param routines - 오늘 선택된 루틴 배열
       * @param userId - 루틴을 설정할 사용자의 ID
       */
      setTodaySelectedRoutines: (routines: Routine[], userId: number) => {
        console.log(`사용자 ${userId}의 오늘 루틴 설정:`, routines.map(r => r.name));
        
        set(state => ({
          todaySelectedRoutines: routines, // 현재 선택된 루틴 업데이트
          currentUserId: userId, // 현재 사용자 ID 업데이트
          userRoutines: {
            ...state.userRoutines, // 기존 `userRoutines` 객체 복사
            [userId]: routines // 특정 사용자 ID에 해당하는 루틴 업데이트/추가
          }
        }));
      },
      
      /**
       * 특정 사용자의 오늘 루틴을 가져옵니다.
       * `currentUserId`와 요청된 `userId`가 일치하면 `todaySelectedRoutines`를 반환하고,
       * 그렇지 않으면 `userRoutines`에서 해당 사용자 ID의 루틴을 반환합니다.
       * @param userId - 루틴을 가져올 사용자의 ID
       * @returns {Routine[]} 해당 사용자의 오늘 루틴 배열 또는 빈 배열
       */
      getTodayRoutines: (userId: number) => {
        const { todaySelectedRoutines, currentUserId, userRoutines } = get();
        
        // 현재 스토어의 `currentUserId`와 요청된 `userId`가 같으면 `todaySelectedRoutines` 반환
        if (currentUserId === userId) {
          return todaySelectedRoutines;
        }
        
        // 그렇지 않으면 `userRoutines` 객체에서 해당 `userId`의 루틴을 찾아 반환
        // 해당 사용자 루틴이 없으면 빈 배열 반환
        return userRoutines[userId] || [];
      },
      
      /**
       * 스토어의 모든 사용자 관련 데이터를 초기화합니다.
       * 주로 로그아웃 시 호출됩니다.
       */
      clearUserData: () => {
        console.log('대시보드 스토어 사용자 데이터 초기화');
        set({ 
          todaySelectedRoutines: [], // 오늘 선택된 루틴 초기화
          currentUserId: null,       // 현재 사용자 ID 초기화
          userRoutines: {}           // 모든 사용자별 루틴 데이터 초기화
        });
      },
    }),
    {
      name: 'dashboard-storage', // 로컬 스토리지에 저장될 키 이름
      // `partialize`를 사용하여 스토어 상태 중 일부만 영속화
      // `userRoutines`와 `currentUserId`만 로컬 스토리지에 저장하고 복원합니다.
      // `todaySelectedRoutines`는 `userRoutines[currentUserId]`에서 파생되므로 별도로 영속화하지 않아도 됩니다.
      partialize: (state) => ({ 
        userRoutines: state.userRoutines,
        currentUserId: state.currentUserId,
      }),
    }
  )
);