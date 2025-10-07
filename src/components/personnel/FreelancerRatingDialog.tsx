import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';

interface FreelancerRatingDialogProps {
  freelancerId: string;
  freelancerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRatingSubmitted?: () => void;
}

export const FreelancerRatingDialog: React.FC<FreelancerRatingDialogProps> = ({
  freelancerId,
  freelancerName,
  open,
  onOpenChange,
  onRatingSubmitted
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { activeTeam } = useTeam();
  const { user } = useAuth();
  const { events, assignments } = useEnhancedData();

  // Buscar eventos onde o freelancer foi alocado
  const freelancerEvents = events.filter(event => {
    return assignments.some(assignment => 
      assignment.personnel_id === freelancerId && 
      assignment.event_id === event.id &&
      event.end_date && new Date(event.end_date) < new Date() // Apenas eventos finalizados
    );
  });

  const handleSubmitRating = async () => {
    if (!activeTeam || !user || !selectedEventId || rating === 0) {
      toast({
        title: "Erro",
        description: "Selecione um evento e uma avaliação",
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
          event_id: selectedEventId,
          freelancer_id: freelancerId,
          rating: rating,
          rated_by_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Avaliação enviada!",
        description: `${freelancerName} foi avaliado com ${rating} estrela${rating > 1 ? 's' : ''}`
      });

      onRatingSubmitted?.();
      onOpenChange(false);
      setRating(0);
      setSelectedEventId('');
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
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="cursor-pointer hover:scale-110 transition-transform"
        >
          <Star
            className={`w-8 h-8 ${
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar Freelancer</DialogTitle>
          <DialogDescription>
            Avalie a performance de {freelancerName} em um evento específico
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Selecionar Evento
            </label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um evento finalizado" />
              </SelectTrigger>
              <SelectContent>
                {freelancerEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name} - {new Date(event.end_date!).toLocaleDateString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">
              Avaliação (1 a 5 estrelas)
            </label>
            <div className="flex justify-center gap-2">
              {renderStars()}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                {rating} estrela{rating > 1 ? 's' : ''} selecionada{rating > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitRating}
            disabled={!selectedEventId || rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};