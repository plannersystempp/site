import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';

interface FreelancerAverageRatingProps {
  freelancerId: string;
  showCount?: boolean;
}

export const FreelancerAverageRating: React.FC<FreelancerAverageRatingProps> = ({
  freelancerId,
  showCount = true
}) => {
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { activeTeam } = useTeam();

  useEffect(() => {
    const fetchRatings = async () => {
      if (!activeTeam) return;

      try {
        const { data, error } = await supabase
          .from('freelancer_ratings')
          .select('rating')
          .eq('team_id', activeTeam.id)
          .eq('freelancer_id', freelancerId);

        if (error) throw error;

        if (data && data.length > 0) {
          const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
          const average = totalRating / data.length;
          setAverageRating(average);
          setRatingCount(data.length);
        } else {
          setAverageRating(0);
          setRatingCount(0);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
        setAverageRating(0);
        setRatingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [freelancerId, activeTeam]);

  if (loading) {
    return <span className="text-sm text-muted-foreground">Carregando...</span>;
  }

  if (ratingCount === 0) {
    return <span className="text-sm text-muted-foreground">Sem avaliações</span>;
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= Math.round(averageRating);
      
      return (
        <Star
          key={index}
          className={`w-4 h-4 ${
            isActive 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      );
    });
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {renderStars()}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {averageRating.toFixed(1)}
        {showCount && (
          <span className="text-xs ml-1">
            ({ratingCount} avaliação{ratingCount > 1 ? 'ões' : ''})
          </span>
        )}
      </span>
    </div>
  );
};