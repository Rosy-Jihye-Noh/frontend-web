import React from 'react';
import { Card } from '../ui/card';

interface Exercise {
    id: number;
    name: string;
    thumbnail: string;
    liked: boolean;
}

interface LikedExercisesSectionProps {
    likedExercises: Exercise[];
}

const LikedExercisesSection: React.FC<LikedExercisesSectionProps> = ({ likedExercises }) => (
    <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">좋아요한 운동</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {likedExercises.map(ex => (
                <div key={ex.id} className="text-center">
                    <img src={ex.thumbnail} alt={ex.name} className="w-full h-24 object-cover rounded-md mb-2" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{ex.name}</p>
                </div>
            ))}
        </div>
    </Card>
);

export default LikedExercisesSection;