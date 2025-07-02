export interface User {
    id: number; 
    name: string;
    goal: string;
    profileImageUrl: string | null;
}

export interface ProfileUser {
  id: number;
  email: string;
  name: string;
  role: 'MEMBER' | 'ADMIN';
  goal: string | null;
  birthday: string | null;
  gender: string | null;
  weight: number | null;
  height: number | null;
  profileImageUrl: string | null;
}

export interface RoutineExercise {
  exerciseId: number;
  exerciseName: string;
  order: number;
}

export interface Routine {
  id: number;
  name: string;
  description: string;
  exercises: RoutineExercise[];
}

export interface Exercise {
    id: number;
    name: string;
    thumbnail: string;
    liked: boolean;
}

export interface AnalysisHistory {
    id: string;
    date: string;
    score: number;
}
