import React, { useEffect, useRef, useState } from 'react';
import { Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTeam } from '@/contexts/TeamContext';
import { getFreelancerRatingMetrics } from '@/services/freelancerRatingsService';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FreelancerRatingMetricsProps {
  freelancerId: string;
}

export const FreelancerRatingMetrics: React.FC<FreelancerRatingMetricsProps> = ({ freelancerId }) => {
  const { activeTeam } = useTeam();
  const isValidUUID = useRef(false);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [lastRatingAt, setLastRatingAt] = useState<string | undefined>(undefined);
  const [avgIntervalMs, setAvgIntervalMs] = useState<number | undefined>(undefined);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    if (!activeTeam || !isValidUUID.current) return;
    try {
      const metrics = await getFreelancerRatingMetrics(activeTeam.id, freelancerId);
      setDistribution(metrics.distribution);
      setLastRatingAt(metrics.lastRatingAt);
      setAvgIntervalMs(metrics.averageIntervalMs);
      setCount(metrics.count ?? 0);
    } catch (err) {
      console.error('[Rating] metrics fetch failed', err);
      setDistribution({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      setLastRatingAt(undefined);
      setAvgIntervalMs(undefined);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeTeam) return;
    isValidUUID.current = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(freelancerId);
    if (!isValidUUID.current) {
      setLoading(false);
      return;
    }
    fetchMetrics();
    const channel = supabase
      .channel(`freelancer_rating_metrics_${freelancerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'freelancer_ratings',
        filter: `freelancer_id=eq.${freelancerId}`
      }, () => fetchMetrics())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [activeTeam, freelancerId]);

  if (loading) {
    return <div className="text-xs sm:text-sm text-muted-foreground">Carregando métricas...</div>;
  }

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      {/* Total de avaliações */}
      <div className="text-xs sm:text-sm text-muted-foreground font-medium">
        {count} {count === 1 ? 'avaliação' : 'avaliações'}
      </div>
      {/* Distribuição de notas com estilo alinhado ao tema */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
        {[5,4,3,2,1].map((score) => (
          <Badge
            key={score}
            variant="secondary"
            className="inline-flex items-center gap-1.5 h-5 sm:h-6 px-2 sm:px-2.5 text-[10px] sm:text-[11px] rounded-md bg-muted text-muted-foreground"
            title={`Notas ${score} estrelas`}
          >
            <span className="font-medium">{score}</span>
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-primary text-primary" />
            <span className="opacity-80">({distribution[score] ?? 0})</span>
          </Badge>
        ))}
      </div>

      {/* Tempo médio / última avaliação */}
      {(lastRatingAt || avgIntervalMs) && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
          {lastRatingAt && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              Última avaliação {formatDistanceToNow(new Date(lastRatingAt), { addSuffix: true, locale: ptBR })}
            </span>
          )}
          {typeof avgIntervalMs === 'number' && (
            <span className="inline-flex items-center gap-1.5">
              • Intervalo médio: {Math.round(avgIntervalMs / (1000 * 60))} min
            </span>
          )}
        </div>
      )}
    </div>
  );
};