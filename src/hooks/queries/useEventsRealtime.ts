import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import { eventKeys } from './useEventsQuery';

/**
 * FASE 2: Sistema Realtime Otimizado com Invalidação
 * Hook para sincronização em tempo real de eventos
 * ✅ Usa invalidateQueries para garantir atualização mesmo em queries inativas
 */
export const useEventsRealtime = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam?.id) return;

    logger.realtime.connected();

    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `team_id=eq.${activeTeam.id}`
        },
        async (payload) => {
          const eventId = (payload.new as any)?.id || (payload.old as any)?.id;
          
          
          logger.realtime.change(payload.eventType, { id: eventId });

          // ⚡ OTIMIZADO: Invalidar queries em vez de setQueryData
          // Isso garante que tanto queries ativas quanto inativas sejam marcadas como stale
          logger.cache.invalidate('eventKeys.all');
          
          queryClient.invalidateQueries({ 
            queryKey: eventKeys.all,
            refetchType: 'active' // Refetch apenas queries ativas imediatamente
          });

          // Também invalidar queries inativas para próxima montagem
          queryClient.invalidateQueries({ 
            queryKey: eventKeys.all,
            refetchType: 'none' // Apenas marcar como stale sem refetch
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
