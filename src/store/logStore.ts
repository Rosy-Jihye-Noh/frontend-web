import { create } from 'zustand'; // Zustand 라이브러리에서 `create` 함수 임포트
import { persist } from 'zustand/middleware'; // Zustand 미들웨어에서 `persist` (상태 영속화) 임포트
import { toast } from 'sonner'; // Sonner 토스트 알림 라이브러리 임포트
import * as exerciseLogApi from '@/services/api/exerciseLogApi'; // 운동 로그 관련 API 함수들 임포트
import type { Routine, RoutineExercise, ExerciseLog } from '@/types/index'; // 타입 정의 임포트

// --- 타입 정의 ---
// 세션 내 개별 운동의 상태를 정의하는 인터페이스
interface SessionExercise {
  exerciseId: number; // 운동의 고유 ID
  exerciseName: string; // 운동 이름
  isCompleted: boolean; // 운동 완료 여부
}

// 세션 내 루틴의 상태를 정의하는 인터페이스
interface SessionRoutine {
  logId: number | null; // 이 루틴과 연결된 서버 로그의 ID (아직 저장되지 않았으면 null)
  routineId: number; // 루틴의 고유 ID
  routineName: string; // 루틴 이름
  exercises: SessionExercise[]; // 루틴에 포함된 운동들의 상태 배열
  completionRate: number; // 이 루틴의 완료율 (0-100)
}

// 로그 세션 스토어의 전체 상태 및 액션 인터페이스
interface LogSessionState {
  selectedDate: string; // 현재 달력에서 선택된 날짜 (YYYY-MM-DD 형식)
  sessions: Record<string, SessionRoutine[]>; // 날짜(YYYY-MM-DD)를 키로 하는 운동 세션 데이터
  pastLogs: ExerciseLog[]; // 사용자의 과거 운동 기록 목록 (서버에서 불러옴)
  currentDayMemo: string; // 현재 선택된 날짜의 메모
  isLoading: boolean; // 데이터 처리 중인지 여부 (예: API 호출 중)

  // 액션 함수들 정의
  // `fetchPastLogs`: 특정 사용자의 과거 운동 기록을 불러와 `pastLogs` 상태를 업데이트
  fetchPastLogs: (userId: number) => Promise<void>;
  // `setSelectedDate`: 달력에서 선택된 날짜를 변경하고 해당 날짜의 메모를 로드
  setSelectedDate: (date: string) => void;
  // `startOrLoadSession`: 특정 날짜에 새 세션을 시작하거나 기존 세션(저장된 로그)을 로드
  startOrLoadSession: (userId: number, routines: Routine[]) => Promise<void>;
  // `addRoutinesToSession`: 현재 세션에 새로운 루틴들을 추가
  addRoutinesToSession: (routines: Routine[]) => void;
  // `toggleExerciseCheck`: 특정 루틴 내 운동의 완료 상태를 토글하고 서버에 저장
  toggleExerciseCheck: (userId: number, routineId: number, exerciseId: number) => Promise<void>;
  // `clearSessionRoutines`: 현재 선택된 날짜의 세션 루틴을 초기화
  clearSessionRoutines: () => void;
  // `updateMemo`: 현재 날짜의 메모 내용을 업데이트 (로컬 상태만)
  updateMemo: (memo: string) => void;
  // `saveMemo`: 현재 날짜의 메모를 서버에 저장
  saveMemo: (userId: number) => Promise<void>;
  // `deleteCurrentDayLogs`: 현재 선택된 날짜의 모든 운동 기록을 삭제
  deleteCurrentDayLogs: (userId: number) => Promise<void>;
  // `deleteRoutineFromSession`: 현재 세션에서 특정 루틴을 삭제하고, 관련 서버 로그도 삭제 (선택적으로)
  deleteRoutineFromSession: (userId: number, routineId: number) => Promise<void>;
}

// `useLogStore` Zustand 스토어 생성
export const useLogStore = create<LogSessionState>()(
  // `persist` 미들웨어를 사용하여 스토어 상태를 로컬 스토리지에 영속화
  persist(
    // 스토어의 실제 로직을 정의하는 함수 (set: 상태 업데이트, get: 현재 상태 조회)
    (set, get) => ({
      // 초기 상태
      selectedDate: new Date().toISOString().split('T')[0], // 오늘 날짜를 YYYY-MM-DD 형식으로 초기화
      sessions: {}, // 초기 세션은 비어있는 객체
      pastLogs: [] as ExerciseLog[], // 초기 과거 로그는 빈 배열
      currentDayMemo: '', // 초기 메모는 빈 문자열
      isLoading: false, // 초기 로딩 상태는 false

      /**
       * 특정 사용자의 과거 운동 기록을 서버에서 불러와 상태를 업데이트합니다.
       * @param userId - 과거 기록을 불러올 사용자의 ID
       */
      fetchPastLogs: async (userId) => {
        if (!userId) {
          // 사용자 ID가 없으면 로그와 메모를 초기화하고 종료
          set({ pastLogs: [], currentDayMemo: '' });
          return;
        }
        
        try {
          const logs = await exerciseLogApi.getLogsByUser(userId); // API를 통해 사용자 기록 불러오기
          
          // 보안 강화: 혹시 모를 다른 사용자 ID의 로그를 다시 한번 필터링
          const filteredLogs = logs?.filter(log => log.userId === userId) || [];
          
          // 동일 날짜의 중복 로그 제거: 각 날짜에 대해 가장 최근에 생성된(ID가 큰) 로그만 유지
          const uniqueLogsByDate = filteredLogs.reduce((acc, log) => {
            const existingLogIndex = acc.findIndex(existingLog => existingLog.exerciseDate === log.exerciseDate);
            if (existingLogIndex === -1) {
              // 해당 날짜의 첫 번째 로그인 경우 추가
              acc.push(log);
            } else {
              // 해당 날짜에 이미 로그가 있는 경우, ID가 더 큰(최신) 로그로 대체
              // 백엔드에서 ID가 증가하는 순서로 생성된다고 가정
              if (log.id && acc[existingLogIndex].id && log.id > acc[existingLogIndex].id) {
                acc[existingLogIndex] = log;
              }
            }
            return acc;
          }, [] as ExerciseLog[]); // 초기 accumulator는 빈 ExerciseLog 배열

          const { selectedDate } = get(); // 현재 선택된 날짜 가져오기
          
          // 현재 선택된 날짜의 메모를 `uniqueLogsByDate`에서 찾아 설정 (해당 사용자의 것만)
          const todaysLog = uniqueLogsByDate.find(log => 
            log.exerciseDate === selectedDate && log.userId === userId
          );
          const memo = todaysLog?.memo || ''; // 로그에 메모가 없으면 빈 문자열

          // 과거 로그와 현재 날짜 메모 상태 업데이트
          set({ pastLogs: uniqueLogsByDate, currentDayMemo: memo });
        } catch (error) {
          console.error("사용자", userId, "의 기록 로드 실패:", error);
          set({ pastLogs: [], currentDayMemo: '' }); // 오류 발생 시 기록과 메모 초기화
        }
      },

      /**
       * 달력에서 선택된 날짜를 변경하고, 해당 날짜의 메모를 로드합니다.
       * @param date - 새로 선택된 날짜 (YYYY-MM-DD 형식)
       */
      setSelectedDate: (date) => {
        const { pastLogs } = get(); // 현재 `pastLogs` 상태 가져오기
        
        // 날짜 변경 시 `pastLogs`에서 해당 날짜의 메모를 찾아 설정 (선택된 날짜의 기록 중 최신 로그를 따라감)
        const selectedLog = pastLogs.find(log => log.exerciseDate === date);
        const memo = selectedLog?.memo || ''; // 메모가 없으면 빈 문자열

        // 선택된 날짜와 현재 날짜의 메모 상태 업데이트
        set({ selectedDate: date, currentDayMemo: memo });
      },

      /**
       * 특정 날짜에 새 운동 세션을 시작하거나, 기존에 저장된 세션(로그)을 로드합니다.
       * 루틴별 운동 완료 상태를 로컬 스토리지에 저장하여 세션 유지력을 높입니다.
       * @param userId - 세션을 시작/로드할 사용자의 ID
       * @param routines - 세션에 포함할 루틴 배열
       */
      startOrLoadSession: async (userId, routines) => {
        if (!userId) {
          console.error('사용자 ID가 필요합니다.');
          return;
        }
        
        // 보안 검증: 전달받은 모든 루틴이 실제로 현재 사용자 소유인지 확인
        const invalidRoutines = routines.filter(routine => routine.userId !== userId);
        if (invalidRoutines.length > 0) {
          console.error('보안 위험: 다른 사용자의 루틴이 포함됨', invalidRoutines);
          toast.error('권한이 없는 루틴이 포함되어 있습니다.');
          return;
        }
        
        const { selectedDate, pastLogs } = get(); // 현재 선택된 날짜와 과거 로그 가져오기

        // 해당 날짜의 과거 로그 중 현재 사용자 ID에 해당하는 로그만 필터링
        const logsForSelectedDate = pastLogs.filter(log => 
          log.exerciseDate === selectedDate && log.userId === userId
        );

        console.log(`사용자 ${userId}의 ${selectedDate} 날짜 세션 시작 (보안 검증 후), 해당 날짜 로그 ${logsForSelectedDate.length}개`);

        // 각 루틴에 대해 세션 데이터를 구성합니다.
        const newSessionRoutines = routines.map(routine => {
          // 해당 루틴 ID가 포함된 기존 로그를 찾습니다.
          const existingLog = logsForSelectedDate.find(log => log.routineIds.includes(routine.id));
          
          // 개별 운동의 완료 상태를 로컬 스토리지에서 복원하기 위한 키
          const sessionStorageKey = `session_${userId}_${selectedDate}_${routine.id}`;
          const savedExerciseStates = localStorage.getItem(sessionStorageKey); // 저장된 데이터 가져오기
          
          let exercises: SessionExercise[];
          
          if (savedExerciseStates) {
            // 1. 로컬 스토리지에 저장된 개별 운동 상태가 있으면 복원 (가장 우선)
            try {
              const parsedStates = JSON.parse(savedExerciseStates);
              exercises = routine.exercises.map((ex: RoutineExercise) => {
                const savedState = parsedStates.find((state: any) => state.exerciseId === ex.exerciseId);
                return {
                  exerciseId: ex.exerciseId,
                  exerciseName: ex.exerciseName,
                  isCompleted: savedState ? savedState.isCompleted : false, // 저장된 상태가 없으면 false
                };
              });
              console.log(`${routine.name}: 저장된 운동 상태 복원 ✅`);
            } catch (error) {
              // 파싱 실패 시 기본값으로 초기화
              console.error('저장된 운동 상태 파싱 실패:', error);
              exercises = routine.exercises.map((ex: RoutineExercise) => ({
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                isCompleted: false,
              }));
            }
          } else if (existingLog && existingLog.completionRate !== undefined) {
            // 2. 로컬 스토리지에 저장된 상태가 없고 기존 로그가 있다면 완료율 기반으로 상태 추정
            exercises = routine.exercises.map((ex: RoutineExercise, index) => {
              let isCompleted = false;
              if (existingLog.completionRate === 100) {
                isCompleted = true; // 100% 완료면 모든 운동 완료로 추정
              } else if (existingLog.completionRate > 0) {
                // 부분 완료의 경우, 완료율에 비례하여 앞부분 운동들이 완료되었다고 추정
                const totalExercises = routine.exercises.length;
                const completedCount = Math.floor((existingLog.completionRate / 100) * totalExercises);
                isCompleted = index < completedCount;
              }
              return {
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                isCompleted: isCompleted,
              };
            });
            console.log(`${routine.name}: 완료율(${existingLog.completionRate}%) 기반 상태 추정 📊`);
          } else {
            // 3. 기존 로그도 없고 저장된 상태도 없으면 새로운 세션으로 간주, 모든 운동 미완료
            exercises = routine.exercises.map((ex: RoutineExercise) => ({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              isCompleted: false,
            }));
            console.log(`${routine.name}: 새로운 세션 시작 🚀`);
          }
          
          return {
            logId: existingLog?.id || null, // 기존 로그가 있으면 logId 설정
            routineId: routine.id,
            routineName: routine.name,
            exercises: exercises,
            completionRate: existingLog?.completionRate || 0, // 기존 로그의 완료율 또는 0
          };
        });
        
        // 현재 날짜의 세션 상태를 업데이트합니다.
        set(state => ({
          sessions: { ...state.sessions, [selectedDate]: newSessionRoutines }
        }));
      },

      /**
       * 현재 세션에 새로운 루틴들을 추가합니다.
       * 이미 세션에 있는 루틴은 중복 추가되지 않습니다.
       * @param routinesToAdd - 세션에 추가할 루틴 배열
       */
      addRoutinesToSession: (routinesToAdd) => {
        const { selectedDate, sessions } = get(); // 현재 날짜와 세션 상태 가져오기
        const currentRoutines = sessions[selectedDate] || []; // 현재 날짜의 루틴 세션 (없으면 빈 배열)
        
        // 추가하려는 루틴 중 현재 세션에 없는 루틴만 필터링하여 `newRoutines` 배열 생성
        const newRoutines = routinesToAdd
          .filter(newRoutine => !currentRoutines.some(existing => existing.routineId === newRoutine.id))
          .map(routine => ({
            logId: null, // 새로 추가되므로 아직 서버 로그 ID는 없음
            routineId: routine.id,
            routineName: routine.name,
            exercises: routine.exercises.map((ex: RoutineExercise) => ({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              isCompleted: false, // 새로 추가되므로 미완료 상태
            })),
            completionRate: 0, // 새로 추가되므로 완료율 0%
          }));
        
        if(newRoutines.length > 0) {
          // 새로운 루틴이 있다면 상태 업데이트: 기존 세션에 새로운 루틴들을 추가
          set(state => ({
            sessions: {
              ...state.sessions,
              [selectedDate]: [...currentRoutines, ...newRoutines]
            }
          }));
          toast.info(`${newRoutines.length}개 루틴이 추가되었습니다. 🎉`);
        } else {
          toast.info("이미 추가된 루틴입니다. 💡"); // 중복 루틴 추가 시 알림
        }
      },

      /**
       * 특정 루틴 내 특정 운동의 완료 상태를 토글(체크/체크 해제)하고,
       * 루틴의 완료율을 업데이트하며, 변경사항을 서버에 자동 저장합니다.
       * @param userId - 현재 사용자 ID
       * @param routineId - 상태를 변경할 루틴의 ID
       * @param exerciseId - 상태를 토글할 운동의 ID
       */
      toggleExerciseCheck: async (userId, routineId, exerciseId) => {
        set({ isLoading: true }); // 로딩 상태 시작
        const { selectedDate, sessions } = get(); // 현재 날짜와 세션 상태 가져오기
        const originalSession = sessions[selectedDate] || []; // 롤백을 위한 원본 세션 복사
        const targetRoutine = originalSession.find(r => r.routineId === routineId); // 해당 루틴 찾기
        
        if (!targetRoutine) { set({ isLoading: false }); return; } // 루틴이 없으면 종료

        // 해당 운동의 완료 상태를 토글한 새 운동 배열 생성
        const updatedExercises = targetRoutine.exercises.map(ex => 
          ex.exerciseId === exerciseId ? { ...ex, isCompleted: !ex.isCompleted } : ex
        );
        // 완료된 운동 개수 및 새 완료율 계산
        const completedCount = updatedExercises.filter(ex => ex.isCompleted).length;
        const newCompletionRate = (completedCount / updatedExercises.length) * 100;
        // 업데이트된 루틴 객체 생성
        const updatedRoutine = { ...targetRoutine, exercises: updatedExercises, completionRate: newCompletionRate };
        
        // 로컬 세션 상태를 먼저 업데이트 (낙관적 업데이트)
        const newSession = originalSession.map(r => r.routineId === routineId ? updatedRoutine : r);
        set(state => ({ sessions: { ...state.sessions, [selectedDate]: newSession } }));

        // 개별 운동 상태를 로컬 스토리지에 저장하여 세션 유지
        const sessionStorageKey = `session_${userId}_${selectedDate}_${routineId}`;
        const exerciseStates = updatedExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          isCompleted: ex.isCompleted
        }));
        localStorage.setItem(sessionStorageKey, JSON.stringify(exerciseStates));
        console.log(`운동 상태 저장: ${targetRoutine.routineName} - 완료율 ${newCompletionRate.toFixed(1)}%`);

        try {
          let newLogId = updatedRoutine.logId; // 루틴의 현재 logId 가져오기
          if (newLogId) {
            // 기존 로그가 있으면 해당 로그의 완료율만 업데이트
            await exerciseLogApi.updateLog(newLogId, { completionRate: newCompletionRate });
            console.log(`로그 업데이트: Log ID ${newLogId}, 완료율 ${newCompletionRate.toFixed(1)}%`);
          } else {
            // 기존 로그가 없으면 새로운 로그 생성
            const createData = { userId, exerciseDate: selectedDate, completionRate: newCompletionRate, routineIds: [routineId], memo: "" };
            newLogId = await exerciseLogApi.createLog(createData); // 생성된 로그의 ID를 받음
            console.log(`새 로그 생성: Log ID ${newLogId}, 완료율 ${newCompletionRate.toFixed(1)}%`);
            // 생성된 logId를 해당 세션 루틴에 반영 (로컬 상태 업데이트)
            const finalSession = get().sessions[selectedDate].map(r => r.routineId === routineId ? { ...r, logId: newLogId } : r);
            set(state => ({ sessions: { ...state.sessions, [selectedDate]: finalSession } }));
          }
          // 완료율이 100%가 되면 완료 토스트 메시지 표시
          if (newCompletionRate === 100) toast.success(`'${updatedRoutine.routineName}' 루틴 완료! 🎉`);
          // 변경사항 반영을 위해 과거 로그 데이터를 다시 불러옴
          await get().fetchPastLogs(userId);
        } catch (error) {
          toast.error("자동 저장에 실패했습니다. 다시 시도해주세요. 😔");
          // 오류 발생 시 UI를 원래 상태로 롤백
          set(state => ({ sessions: { ...state.sessions, [selectedDate]: originalSession } }));
        } finally {
          set({ isLoading: false }); // 로딩 상태 종료
        }
      },
      
      /**
       * 현재 날짜의 메모 내용을 업데이트합니다 (로컬 상태만 변경).
       * @param memo - 새로운 메모 내용
       */
      updateMemo: (memo) => {
        set({ currentDayMemo: memo }); // `currentDayMemo` 상태 업데이트
      },

      /**
       * 현재 날짜의 메모를 서버에 저장합니다.
       * 해당 날짜의 기존 로그가 있으면 메모만 업데이트하고, 없으면 새로운 로그를 생성합니다.
       * @param userId - 메모를 저장할 사용자의 ID
       */
      saveMemo: async (userId) => {
        const { selectedDate, currentDayMemo, pastLogs, sessions } = get(); // 필요한 상태 가져오기
        
        try {
          // 해당 날짜에 이미 존재하는 로그를 찾습니다.
          let existingLog = pastLogs.find(log => log.exerciseDate === selectedDate);
          
          if (existingLog?.id) {
            // 기존 로그가 있으면 해당 로그의 메모만 업데이트
            console.log(`로그 ID ${existingLog.id}의 메모 업데이트:`, currentDayMemo);
            await exerciseLogApi.updateMemo(existingLog.id, currentDayMemo);
          } else {
            // 기존 로그가 없으면 새로운 로그 생성 (단, 현재 날짜에 루틴 세션이 있을 경우에만)
            const todaysSession = sessions[selectedDate];
            if (todaysSession && todaysSession.length > 0) {
              const routineIds = todaysSession.map(session => session.routineId); // 현재 세션의 루틴 ID들
              const createData = { 
                userId, 
                exerciseDate: selectedDate, 
                completionRate: 0, // 메모만 저장하는 경우 완료율은 0으로 시작
                routineIds, 
                memo: currentDayMemo 
              };
              console.log('새 로그 생성 (메모 저장):', createData);
              await exerciseLogApi.createLog(createData);
            }
          }
          
          // 메모 저장 후, 과거 로그 데이터를 다시 불러와 최신 상태를 반영
          await get().fetchPastLogs(userId);
          toast.success("메모가 저장되었습니다. 📝");
        } catch (error) {
          console.error("Failed to save memo:", error);
          toast.error("메모 저장에 실패했습니다. 😔");
        }
      },

      /**
       * 현재 선택된 날짜의 모든 운동 기록(로그)을 서버와 로컬 스토어에서 삭제합니다.
       * @param userId - 운동 기록을 삭제할 사용자의 ID
       */
      deleteCurrentDayLogs: async (userId) => {
        const { selectedDate, pastLogs } = get(); // 현재 날짜와 과거 로그 가져오기
        
        try {
          // 해당 날짜의 모든 운동 로그를 찾습니다.
          const logsToDelete = pastLogs.filter(log => log.exerciseDate === selectedDate);
          
          if (logsToDelete.length === 0) {
            toast.info("삭제할 운동 기록이 없습니다. 🤷‍♀️");
            return;
          }

          // 각 로그를 개별적으로 서버에서 삭제 요청
          for (const log of logsToDelete) {
            if (log.id) {
              console.log(`서버에서 로그 삭제: Log ID ${log.id}`);
              await exerciseLogApi.deleteLog(log.id);
            }
          }
          
          // 로컬 상태(sessions, currentDayMemo)도 업데이트하여 UI에 즉시 반영
          set(state => ({
            sessions: { ...state.sessions, [selectedDate]: [] }, // 해당 날짜의 세션 초기화
            currentDayMemo: '', // 해당 날짜의 메모 초기화
          }));
          
          // 로컬 스토리지에 저장된 해당 날짜의 모든 세션 상태도 삭제
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // 'session_<userId>_<selectedDate>_' 패턴으로 시작하는 모든 키를 찾습니다.
            if (key && key.startsWith(`session_${userId}_${selectedDate}_`)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key)); // 찾은 키들을 로컬 스토리지에서 제거
          console.log(`${selectedDate} 날짜의 모든 세션 상태 정리: ${keysToRemove.length}개`);
          
          // 모든 삭제 작업 완료 후, 과거 로그 데이터를 다시 불러와 최신 상태를 반영
          await get().fetchPastLogs(userId);
          toast.success(`${logsToDelete.length}개의 운동 기록이 삭제되었습니다. ✅`);
        } catch (error) {
          console.error("Failed to delete logs:", error);
          toast.error("운동 기록 삭제에 실패했습니다. 😔");
        }
      },

      /**
       * 현재 세션에서 특정 루틴을 삭제하고, 해당 루틴과 연결된 서버 로그도 삭제합니다.
       * @param userId - 현재 사용자 ID
       * @param routineId - 세션에서 삭제할 루틴의 ID
       */
      deleteRoutineFromSession: async (userId: number, routineId: number) => {
        const { selectedDate, sessions } = get(); // 현재 날짜와 세션 상태 가져오기
        
        try {
          const currentSession = sessions[selectedDate] || []; // 현재 날짜의 세션
          const targetRoutine = currentSession.find(r => r.routineId === routineId); // 삭제할 루틴 찾기
          
          if (targetRoutine && targetRoutine.logId && targetRoutine.logId > 0) {
            // 루틴에 연결된 서버 로그(logId)가 있으면 서버에 삭제 요청
            console.log(`서버에서 로그 삭제: Log ID ${targetRoutine.logId}`);
            await exerciseLogApi.deleteLog(targetRoutine.logId);
          } else {
            // 연결된 로그가 없으면 로컬 세션에서만 제거
            console.log(`로컬 세션에서만 루틴 제거 (로그 ID 없음): Routine ID ${routineId}`);
          }
          
          // 로컬 세션에서 해당 루틴 제거하여 UI 즉시 업데이트
          const updatedSession = currentSession.filter(r => r.routineId !== routineId);
          
          set(state => ({
            sessions: { ...state.sessions, [selectedDate]: updatedSession }
          }));
          
          // 로컬 스토리지에 저장된 해당 루틴의 세션 상태도 삭제
          const sessionStorageKey = `session_${userId}_${selectedDate}_${routineId}`;
          localStorage.removeItem(sessionStorageKey);
          console.log(`루틴 ${routineId}의 세션 상태 정리 완료`);
          
          // 모든 삭제 작업 완료 후, 과거 로그 데이터를 다시 불러와 최신 상태를 반영
          await get().fetchPastLogs(userId);
          toast.success("루틴이 세션에서 삭제되었습니다. 🗑️");
        } catch (error) {
          console.error("Failed to delete routine:", error);
          // 404 에러인 경우, 이미 서버에서 삭제된 것으로 간주하고 로컬에서만 제거
          if ((error as any)?.response?.status === 404) {
            console.log('로그가 이미 서버에서 삭제됨, 로컬에서만 제거 진행');
            const { selectedDate, sessions } = get();
            const currentSession = sessions[selectedDate] || [];
            const updatedSession = currentSession.filter(r => r.routineId !== routineId);
            
            set(state => ({
              sessions: { ...state.sessions, [selectedDate]: updatedSession }
            }));
            
            const sessionStorageKey = `session_${userId}_${selectedDate}_${routineId}`;
            localStorage.removeItem(sessionStorageKey);
            
            await get().fetchPastLogs(userId);
            toast.success("루틴이 세션에서 삭제되었습니다. (서버에서 이미 삭제됨) 🗑️");
          } else {
            toast.error("루틴 삭제에 실패했습니다. 😔");
          }
        }
      },

      /**
       * 현재 선택된 날짜의 세션 루틴을 초기화합니다.
       * (주로 날짜 변경 시 또는 특정 상황에서 세션을 비울 때 사용)
       */
      clearSessionRoutines: () => {
        const { selectedDate } = get(); // 현재 선택된 날짜 가져오기
        console.log(`세션 루틴 초기화: ${selectedDate}`);
        set(state => ({
          sessions: { ...state.sessions, [selectedDate]: [] } // 해당 날짜의 세션 배열을 빈 배열로 설정
        }));
      }
    }),
    {
      name: 'exercise-log-storage', // 로컬 스토리지에 저장될 키 이름
      // `partialize`를 사용하여 스토어 상태 중 일부만 영속화합니다.
      // `pastLogs`는 매번 `fetchPastLogs`를 통해 서버에서 불러오므로 영속화할 필요가 없습니다.
      partialize: (state) => ({ 
        selectedDate: state.selectedDate,      // 선택된 날짜
        sessions: state.sessions,              // 세션 데이터
        currentDayMemo: state.currentDayMemo,  // 현재 날짜의 메모
      }),
    }
  )
);