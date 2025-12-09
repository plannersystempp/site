import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import { divisionsKeys } from './useDivisionsQuery';

/**
 * FASE 2: Sistema Realtime Otimizado com Invalidação
 * Hook para sincronização em tempo real de divisões de eventos
 * ✅ Sincroniza lista de divisões em formulários e cards automaticamente
 */
export const useDivisionsRealtime = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam?.id) return;

    logger.realtime.connected();

    const channel = supabase
      .channel('divisions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_divisions',
          filter: `team_id=eq.${activeTeam.id}`
        },
        async (payload) => {
          const divisionId = (payload.new as any)?.id || (payload.old as any)?.id;
          
          
          logger.realtime.change(payload.eventType, { id: divisionId });

          // ⚡ OTIMIZADO: Invalidar queries de divisões
          logger.cache.invalidate('divisionsKeys.all');
          
          queryClient.invalidateQueries({ 
            queryKey: divisionsKeys.all,
            refetchType: 'active'
          });

          queryClient.invalidateQueries({ 
            queryKey: divisionsKeys.all,
            refetchType: 'none'
          });


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
