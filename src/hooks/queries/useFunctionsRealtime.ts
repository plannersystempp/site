import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import { functionKeys } from './useFunctionsQuery';

/**
 * FASE 2: Sistema Realtime Otimizado com Invalidação
 * Hook para sincronização em tempo real de funções
 * ✅ Sincroniza formulários automaticamente quando funções são criadas/editadas
 */
export const useFunctionsRealtime = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam?.id) return;

    logger.realtime.connected();
    console.log('🔌 [Realtime Functions] Connecting for team:', activeTeam.id);

    const channel = supabase
      .channel('functions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'functions',
          filter: `team_id=eq.${activeTeam.id}`
        },
        async (payload) => {
          const functionId = (payload.new as any)?.id || (payload.old as any)?.id;
          
          console.log('🔄 [Realtime Functions] Change detected:', {
            type: payload.eventType,
            functionId,
            timestamp: new Date().toISOString(),
          });
          
          logger.realtime.change(payload.eventType, { id: functionId });

          // ⚡ OTIMIZADO: Invalidar queries de funções
          console.log('♻️ [Realtime Functions] Invalidating functions queries');
          
          queryClient.invalidateQueries({ 
            queryKey: functionKeys.all,
            refetchType: 'active'
          });

          queryClient.invalidateQueries({ 
            queryKey: functionKeys.all,
            refetchType: 'none'
          });

          console.log('✅ [Realtime Functions] Cache invalidated successfully');
        }
      )
      .subscribe((status) => {
        console.log('📡 [Realtime Functions] Subscription status:', status);
      });

    return () => {
      console.log('🔌 [Realtime Functions] Unsubscribing from functions changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
