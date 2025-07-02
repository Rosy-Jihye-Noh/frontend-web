export const fetchAllExercises = () => fetch('http://localhost:8081/api/exercises').then(res => res.json());

export const fetchUserLikes = (userId: number) => fetch(`http://localhost:8081/api/exercise-likes/user/${userId}`).then(res => res.json());

export const fetchUserRoutines = (userId: number) => fetch(`http://localhost:8081/api/routines/user/${userId}`).then(res => res.json());

export const addLikeApi = (userId: number, exerciseId: number) => fetch('http://localhost:8081/api/exercise-likes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, exerciseId })
});

export const removeLikeApi = (userId: number, exerciseId: number) => fetch(`http://localhost:8081/api/exercise-likes?userId=${userId}&exerciseId=${exerciseId}`, { method: 'DELETE' });

export const addExerciseToRoutineApi = (routineId: number, exerciseId: number) => fetch(`http://localhost:8081/api/routines/${routineId}/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseId })
});