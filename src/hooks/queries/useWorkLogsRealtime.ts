import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import { workLogsKeys } from './useWorkLogsQuery';

/**
 * FASE 2: Sistema Realtime Otimizado com Invalidação
 * Hook para sincronização em tempo real de lançamentos de horas
 * ✅ Atualiza folha de pagamento e dashboard automaticamente
 */
export const useWorkLogsRealtime = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam?.id) return;

    logger.realtime.connected();
    console.log('🔌 [Realtime WorkLogs] Connecting for team:', activeTeam.id);

    const channel = supabase
      .channel('work-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_records',
          filter: `team_id=eq.${activeTeam.id}`
        },
        async (payload) => {
          const workLogId = (payload.new as any)?.id || (payload.old as any)?.id;
          const eventId = (payload.new as any)?.event_id || (payload.old as any)?.event_id;
          
          console.log('🔄 [Realtime WorkLogs] Change detected:', {
            type: payload.eventType,
            workLogId,
            eventId,
            timestamp: new Date().toISOString(),
          });
          
          logger.realtime.change(payload.eventType, { id: workLogId });

          // ⚡ OTIMIZADO: Invalidar queries de work logs
          console.log('♻️ [Realtime WorkLogs] Invalidating work logs queries');
          
          queryClient.invalidateQueries({ 
            queryKey: workLogsKeys.all,
            refetchType: 'active'
          });

          queryClient.invalidateQueries({ 
            queryKey: workLogsKeys.all,
            refetchType: 'none'
          });

          // Invalidar cache de payroll relacionado ao evento
          if (eventId) {
            queryClient.invalidateQueries({ 
              queryKey: ['payroll', 'event', eventId],
              refetchType: 'active'
            });
            console.log('♻️ [Realtime WorkLogs] Invalidated payroll cache for event:', eventId);
          }

          console.log('✅ [Realtime WorkLogs] Cache invalidated successfully');
        }
      )
      .subscribe((status) => {
        console.log('📡 [Realtime WorkLogs] Subscription status:', status);
      });

    return () => {
      console.log('🔌 [Realtime WorkLogs] Unsubscribing from work logs changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
