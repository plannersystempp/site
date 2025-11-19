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
    console.log('🔌 [Realtime Events] Connecting to events channel for team:', activeTeam.id);

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
          
          console.log('🔄 [Realtime Events] Change detected:', {
            type: payload.eventType,
            eventId,
            timestamp: new Date().toISOString(),
          });
          
          logger.realtime.change(payload.eventType, { id: eventId });

          // ⚡ OTIMIZADO: Invalidar queries em vez de setQueryData
          // Isso garante que tanto queries ativas quanto inativas sejam marcadas como stale
          console.log('♻️ [Realtime Events] Invalidating queries for team:', activeTeam.id);
          
          queryClient.invalidateQueries({ 
            queryKey: eventKeys.all,
            refetchType: 'active' // Refetch apenas queries ativas imediatamente
          });

          // Também invalidar queries inativas para próxima montagem
          queryClient.invalidateQueries({ 
            queryKey: eventKeys.all,
            refetchType: 'none' // Apenas marcar como stale sem refetch
          });

          console.log('✅ [Realtime Events] Cache invalidated successfully');
        }
      )
      .subscribe((status) => {
        console.log('📡 [Realtime Events] Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          logger.realtime.info('✅ [Realtime Events] Successfully subscribed to events changes');
        } else if (status === 'CHANNEL_ERROR') {
          logger.realtime.error('❌ [Realtime Events] Channel error');
        } else if (status === 'TIMED_OUT') {
          logger.realtime.error('⏱️ [Realtime Events] Subscription timed out');
        }
      });

    return () => {
      console.log('🔌 [Realtime Events] Unsubscribing from events changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
