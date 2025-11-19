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
    console.log('🔌 [Realtime Divisions] Connecting for team:', activeTeam.id);

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
          
          console.log('🔄 [Realtime Divisions] Change detected:', {
            type: payload.eventType,
            divisionId,
            timestamp: new Date().toISOString(),
          });
          
          logger.realtime.change(payload.eventType, { id: divisionId });

          // ⚡ OTIMIZADO: Invalidar queries de divisões
          console.log('♻️ [Realtime Divisions] Invalidating divisions queries');
          
          queryClient.invalidateQueries({ 
            queryKey: divisionsKeys.all,
            refetchType: 'active'
          });

          queryClient.invalidateQueries({ 
            queryKey: divisionsKeys.all,
            refetchType: 'none'
          });

          console.log('✅ [Realtime Divisions] Cache invalidated successfully');
        }
      )
      .subscribe((status) => {
        console.log('📡 [Realtime Divisions] Subscription status:', status);
      });

    return () => {
      console.log('🔌 [Realtime Divisions] Unsubscribing from divisions changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
