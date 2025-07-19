// LikedExerciseSection.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Exercise } from '@/types/index';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LikedExercisesSectionProps {
    likedExercises: Exercise[];
}

const LikedExercisesSection: React.FC<LikedExercisesSectionProps> = ({ likedExercises }) => {
    const navigate = useNavigate();

    const handleExerciseClick = (exerciseId: number) => {
        navigate(`/exercises/${exerciseId}`);
    };

    return (
        <Card className="p-6 rounded-2xl shadow-md">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-bold">좋아요한 운동</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {likedExercises.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {likedExercises.map(ex => (
                        <div 
                            key={ex.id} 
                            className="text-center cursor-pointer group transition-transform transform-gpu hover:-translate-y-1"
                            onClick={() => handleExerciseClick(ex.id)}
                        >
                            <div className="w-full aspect-square mb-2 overflow-hidden rounded-lg bg-muted shadow-inner">
                                <img 
                                    src={ex.thumbnailUrl || ''} 
                                    alt={ex.name} 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                />
                            </div>
                            <p className="text-sm font-medium text-foreground truncate">{ex.name}</p>
                        </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10 text-neutral-400">
                    <p>좋아요한 운동이 없습니다.</p>
                </div>
              )}
            </CardContent>
        </Card>
    );
};

export default LikedExercisesSection;