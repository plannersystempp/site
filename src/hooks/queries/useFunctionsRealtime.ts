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
          
          
          logger.realtime.change(payload.eventType, { id: functionId });

          // ⚡ OTIMIZADO: Invalidar queries de funções
          logger.cache.invalidate('functionKeys.all');
          
          queryClient.invalidateQueries({ 
            queryKey: functionKeys.all,
            refetchType: 'active'
          });

          queryClient.invalidateQueries({ 
            queryKey: functionKeys.all,
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
