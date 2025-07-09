export interface User {
    id: number; // ID
    name: string; // 닉네임
    goal: string; // 운동 목표
    role?: 'MEMBER' | 'ADMIN'; // 'MEMBER': 일반 회원, 'ADMIN': 관리자
    profileImageUrl: string | null; // 프로필 이미지 URL. 없을 경우 null
}

export interface ProfileUser {
    id: number; // ID
    email: string; // 이메일
    name: string; // 닉네임
    role: 'MEMBER' | 'ADMIN'; // 'MEMBER': 일반 회원, 'ADMIN': 관리자
    goal: string | null; // 운동 목표
    birthday: string | null; // 생년월일 (YYYY-MM-DD 형식). 없을 경우 null
    gender: string | null; // 성별 ('MALE', 'FEMALE'). 없을 경우 null
    weight: number | null; // 몸무게 (kg). 없을 경우 null
    height: number | null; // 키 (cm). 없을 경우 null
    profileImageUrl: string | null; // 프로필 이미지 URL. 없을 경우 null
}

export interface RoutineExercise {
    exerciseId: number; // 루틴에 포함된 운동의 고유 식별자 (ID)
    exerciseName: string; // 루틴에 포함된 운동의 이름
    order: number; // 루틴 내에서 해당 운동의 순서 (예: 1, 2, 3...)
}

export interface Routine {
    id: number; // 루틴의 고유 식별자 (ID)
    name: string; // 루틴의 이름 (예: "주 3일 전신 운동")
    description: string | null; // 루틴에 대한 간단한 설명. 없을 경우 null
    userId: number; // 이 루틴을 생성한 사용자의 ID
    exercises: RoutineExercise[]; // 루틴에 포함된 운동들의 배열
}

export interface Exercise {
    id: number; // 운동의 고유 식별자 (ID)
    name: string; // 운동의 이름 (예: "스쿼트", "푸쉬업")
    category: string | null; // 운동의 카테고리 (예: "하체", "상체")
    description: string | null; // 운동에 대한 상세 설명
    difficulty: string | null; // 난이도 (예: "초급", "중급")
    posture: string | null; // 자세
    bodyPart: string | null; // 신체 부위 (예: "다리", "가슴")
    thumbnailUrl: string | null; // 운동 썸네일 이미지 URL
    liked?: boolean; // 사용자가 이 운동에 '좋아요'를 눌렀는지 여부
    likeCount?: number; // 이 운동의 총 좋아요 수
}

export interface AnalysisHistoryItem {
    id: number; // 분석 기록의 고유 식별자 (ID)
    createdAt: string; // 분석이 생성된 날짜 (ISO 8601 형식의 날짜/시간 문자열)
    // 각 신체 부위별 자세 점수 (예: 0-100점)
    spineCurvScore: number; // 척추 곡률 점수
    spineScolScore: number; // 척추 측만 점수
    pelvicScore: number; // 골반 점수
    neckScore: number; // 목 점수
    shoulderScore: number; // 어깨 점수
}

export interface ExerciseLog {
    // 서버 응답에서만 사용될 수 있는 선택적 필드
    id?: number; // 운동 로그의 고유 식별자 (ID). 서버에서 생성됩니다.
    createdAt?: string; // 로그가 생성된 시간 (ISO 8601 형식의 날짜/시간 문자열). 서버에서 생성됩니다.
    updatedAt?: string; // 로그가 마지막으로 업데이트된 시간. 서버에서 업데이트됩니다.
    useYn?: 'Y' | 'N'; // 로그의 사용 여부 ('Y': 사용, 'N': 비사용). 서버에서 관리됩니다.

    // 요청(Request) 및 응답(Response)에서 공통으로 사용되는 필수 필드
    userId: number; // 이 로그를 생성한 사용자의 ID
    exerciseDate: string; // 운동을 수행한 날짜 ("YYYY-MM-DD" 형식)
    completionRate: number; // 해당 날짜 운동의 전체 완료율 (0-100)
    memo: string; // 해당 날짜 운동에 대한 메모
    routineIds: number[]; // 이 로그에 포함된 루틴들의 ID 배열
    routineNames?: string[]; // (선택적) 백엔드에서 조회 시 채워지는, 포함된 루틴들의 이름 배열
}

// 사용자 작성 글
export interface UserPost {
    id: number; // 게시글의 고유 식별자 (ID)
    title: string; // 게시글 제목
    content: string; // 게시글 내용
    authorId: number; // 게시글 작성자의 ID
    authorName: string; // 게시글 작성자의 이름 (닉네임)
    createdAt: string; // 게시글이 작성된 시간 (ISO 8601 형식)
    updatedAt: string; // 게시글이 마지막으로 업데이트된 시간
    likesCount: number; // 게시글의 총 좋아요 수
    commentsCount: number; // 게시글의 총 댓글 수
    category: string; // 게시글의 카테고리
}

// 사용자 작성 댓글
export interface UserComment {
    id: number; // 댓글의 고유 식별자 (ID)
    content: string; // 댓글 내용
    postId: number; // 이 댓글이 달린 게시글의 ID
    postTitle: string; // 댓글이 달린 게시글의 제목
    authorId: number; // 댓글 작성자의 ID
    authorName: string; // 댓글 작성자의 이름 (닉네임)
    createdAt: string; // 댓글이 작성된 시간 (ISO 8601 형식)
    updatedAt: string; // 댓글이 마지막으로 업데이트된 시간
}

// 알림
export interface Notification {
    id: number; // 알림의 고유 식별자 (ID)
    type: 'POST_COMMENT' | 'POST_LIKE' | 'COMMENT_REPLY' | 'COMMENT' | 'LIKE' | 'REPLY'; // 알림의 유형
    message: string; // 알림의 주요 메시지 내용
    referenceId?: number; // (선택적) 알림이 참조하는 엔티티의 ID (예: 게시글 ID). `postId`에 해당될 수 있습니다.
    postTitle?: string; // (선택적) 알림과 관련된 게시글의 제목
    read: boolean; // 알림의 읽음 여부 (true: 읽음, false: 안 읽음). `isRead`에 해당될 수 있습니다.
    createdAt: string; // 알림이 생성된 시간 (ISO 8601 형식)
    updatedAt: string; // 알림이 마지막으로 업데이트된 시간
    senderId: number; // 보내는 사용자(알림을 발생시킨 주체)의 ID
    senderName: string; // 닉네임 또는 이름
    userId: number; // 알림을 받는 사용자(수신자)의 ID
    userName: string; // 닉네임 또는 이름
    useYn: 'Y' | 'N'; //알림의 사용 여부 ('Y': 사용, 'N': 비사용)

    // 호환성을 위한 계산된/별칭 속성 (클라이언트 측에서 편의상 사용될 수 있음)
    title?: string; // (선택적) 알림 제목 (메시지에서 파생될 수 있음)
    postId?: number; // (선택적) `referenceId`의 별칭, 주로 게시글 ID를 의미
    isRead?: boolean; // (선택적) `read` 필드의 별칭, `Notification` 컴포넌트 등에서 사용될 수 있음
}