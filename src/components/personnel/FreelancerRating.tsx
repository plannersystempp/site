import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';

interface FreelancerRatingProps {
  eventId: string;
  freelancerId: string;
  freelancerName: string;
  existingRating?: number;
  onRatingSubmitted?: () => void;
}

export const FreelancerRating: React.FC<FreelancerRatingProps> = ({
  eventId,
  freelancerId,
  freelancerName,
  existingRating,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(existingRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { activeTeam } = useTeam();
  const { user } = useAuth();

  const handleRatingSubmit = async (selectedRating: number) => {
    if (!activeTeam || !user) {
      toast({
        title: "Erro",
        description: "Usuário ou equipe não encontrados",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('freelancer_ratings')
        .insert({
          team_id: activeTeam.id,
          event_id: eventId,
          freelancer_id: freelancerId,
          rating: selectedRating,
          rated_by_id: user.id
        });

      if (error) throw error;

      setRating(selectedRating);
      toast({
        title: "Avaliação enviada!",
        description: `${freelancerName} foi avaliado com ${selectedRating} estrela${selectedRating > 1 ? 's' : ''}`,
      });

      onRatingSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar avaliação",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => !existingRating && !isSubmitting && handleRatingSubmit(starValue)}
          onMouseEnter={() => !existingRating && setHoveredRating(starValue)}
          onMouseLeave={() => !existingRating && setHoveredRating(0)}
          disabled={!!existingRating || isSubmitting}
          className={`${
            existingRating ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } transition-transform`}
        >
          <Star
            className={`w-5 h-5 ${
              isActive 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        </button>
      );
    });
  };

  if (existingRating) {
    return (
      <div className="flex items-center gap-1">
        {renderStars()}
        <span className="text-sm text-muted-foreground ml-2">
          Avaliado
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {renderStars()}
      {isSubmitting && (
        <span className="text-sm text-muted-foreground ml-2">
          Enviando...
        </span>
      )}
    </div>
  );
};