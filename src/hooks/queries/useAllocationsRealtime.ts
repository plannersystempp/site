import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import { allocationsKeys } from './useAllocationsQuery';

/**
 * FASE 2: Sistema Realtime Otimizado com Invalidação
 * Hook para sincronização em tempo real de alocações de pessoal
 * ✅ CRÍTICO: Evita conflitos de edição simultânea e sincroniza folha de pagamento
 */
export const useAllocationsRealtime = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam?.id) return;

    logger.realtime.connected();

    const channel = supabase
      .channel('allocations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personnel_allocations',
          filter: `team_id=eq.${activeTeam.id}`
        },
        async (payload) => {
          const allocationId = (payload.new as any)?.id || (payload.old as any)?.id;
          const eventId = (payload.new as any)?.event_id || (payload.old as any)?.event_id;
          
          
          logger.realtime.change(payload.eventType, { id: allocationId });

          // ⚡ OTIMIZADO: Invalidar queries de alocações
          logger.cache.invalidate('allocationsKeys.all');
          
          queryClient.invalidateQueries({ 
            queryKey: allocationsKeys.all,
            refetchType: 'active'
          });

          queryClient.invalidateQueries({ 
            queryKey: allocationsKeys.all,
            refetchType: 'none'
          });

          // Invalidar cache de payroll relacionado ao evento
          if (eventId) {
            queryClient.invalidateQueries({ 
              queryKey: ['payroll', 'event', eventId],
              refetchType: 'active'
            });
            logger.cache.invalidate(`payroll:event:${eventId}`);
          }


        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.realtime.info('SUBSCRIBED');
        } else if (status === 'CHANNEL_ERROR') {
          logger.realtime.error('CHANNEL_ERROR');
        } else if (status === 'TIMED_OUT') {
          logger.realtime.error('TIMED_OUT');
        }
      });

    return () => {
      logger.realtime.debug('UNSUBSCRIBE');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
