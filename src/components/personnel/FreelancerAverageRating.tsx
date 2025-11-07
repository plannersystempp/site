import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { getFreelancerRatingMetrics } from '@/services/freelancerRatingsService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FreelancerAverageRatingProps {
  freelancerId: string;
  showCount?: boolean;
  showDetails?: boolean; // controla se exibe distribuição/tempos aqui
  clickable?: boolean;
  onClick?: () => void;
}

export const FreelancerAverageRating: React.FC<FreelancerAverageRatingProps> = ({
  freelancerId,
  showCount = true,
  showDetails = false,
  clickable = false,
  onClick
}) => {
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [lastRatingAt, setLastRatingAt] = useState<string | undefined>(undefined);
  const [avgIntervalMs, setAvgIntervalMs] = useState<number | undefined>(undefined);
  const { activeTeam } = useTeam();
  const isValidUUID = useRef(false);

  // Função util para buscar e calcular média/contagem
  const fetchRatings = async () => {
    if (!activeTeam || !isValidUUID.current) return;

    try {
      const metrics = await getFreelancerRatingMetrics(activeTeam.id, freelancerId);
      setAverageRating(metrics.average);
      setRatingCount(metrics.count);
      setDistribution(metrics.distribution);
      setLastRatingAt(metrics.lastRatingAt);
      setAvgIntervalMs(metrics.averageIntervalMs);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setAverageRating(0);
      setRatingCount(0);
      setDistribution({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      setLastRatingAt(undefined);
      setAvgIntervalMs(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeTeam) return;

    // Validar UUID uma única vez por ciclo
    isValidUUID.current = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(freelancerId);
    if (!isValidUUID.current) {
      console.log('[Rating] Invalid UUID, skipping fetch:', freelancerId);
      setAverageRating(0);
      setRatingCount(0);
      setLoading(false);
      return;
    }

    // Fetch inicial
    fetchRatings();

    // Assinatura realtime para atualizações (INSERT/UPDATE/DELETE)
    const channel = supabase
      .channel(`freelancer_ratings_${freelancerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'freelancer_ratings',
        filter: `freelancer_id=eq.${freelancerId}`
      }, () => {
        // Refetch quando houver qualquer mudança nas avaliações deste freelancer
        fetchRatings();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // opcional: log
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
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

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={clickable ? 'Ver desempenho' : undefined}
      className={`${showDetails ? 'flex flex-col gap-2' : 'flex items-center gap-1'} ${clickable ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-sm' : ''}`}
    >
      {children}
    </div>
  );

  return (
    <Wrapper>
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {renderStars()}
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {averageRating.toFixed(1)}
          {showCount && (
            <span className="text-xs ml-1">
              ({ratingCount} {ratingCount === 1 ? 'avaliação' : 'avaliações'})
            </span>
          )}
        </span>
      </div>
      {showDetails && (
        <>
          {/* Distribuição de notas */}
          {ratingCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {[5,4,3,2,1].map((score) => (
                <span key={score} className="inline-flex items-center gap-1">
                  <span className="font-medium">{score}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>({distribution[score] ?? 0})</span>
                </span>
              ))}
            </div>
          )}
          {/* Tempo médio/última avaliação */}
          {lastRatingAt && (
            <div className="text-xs text-muted-foreground">
              Última avaliação {formatDistanceToNow(new Date(lastRatingAt), { addSuffix: true, locale: ptBR })}
              {avgIntervalMs && (
                <span className="ml-2">
                  • Intervalo médio entre avaliações: {Math.round(avgIntervalMs / (1000 * 60))} min
                </span>
              )}
            </div>
          )}
        </>
      )}
    </Wrapper>
  );
};