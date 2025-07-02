export interface User {
    name: string;
    goal: string;
    profileImageUrl: string;
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
