import React, { useEffect, useState } from 'react';
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
  const [currentRowId, setCurrentRowId] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { activeTeam } = useTeam();
  const { user } = useAuth();

  useEffect(() => {
    const fetchExisting = async () => {
      if (!activeTeam || !user) return;
      const { data, error } = await supabase
        .from('freelancer_ratings')
        .select('id, rating')
        .eq('team_id', activeTeam.id)
        .eq('event_id', eventId)
        .eq('freelancer_id', freelancerId)
        .eq('rated_by_id', user.id)
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        setCurrentRowId(data.id as string);
        setRating(Number(data.rating) || 0);
      }
    };
    fetchExisting();
  }, [activeTeam, user, eventId, freelancerId]);

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
      if (currentRowId) {
        const { error } = await supabase
          .from('freelancer_ratings')
          .update({ rating: selectedRating })
          .eq('id', currentRowId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('freelancer_ratings')
          .insert({
            team_id: activeTeam.id,
            event_id: eventId,
            freelancer_id: freelancerId,
            rating: selectedRating,
            rated_by_id: user.id
          })
          .select('id')
          .maybeSingle();
        if (error) throw error;
        if (data?.id) setCurrentRowId(String(data.id));
      }

      setRating(selectedRating);
      toast({
        title: "Avaliação salva",
        description: `${freelancerName} avaliado com ${selectedRating} estrela${selectedRating > 1 ? 's' : ''}`,
      });

      onRatingSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar avaliação",
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
          onClick={() => !isSubmitting && handleRatingSubmit(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          disabled={isSubmitting}
          className={`${
            'cursor-pointer hover:scale-110'
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
