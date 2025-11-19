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
    console.log('🔌 [Realtime Allocations] Connecting for team:', activeTeam.id);

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
          
          console.log('🔄 [Realtime Allocations] Change detected:', {
            type: payload.eventType,
            allocationId,
            eventId,
            timestamp: new Date().toISOString(),
          });
          
          logger.realtime.change(payload.eventType, { id: allocationId });

          // ⚡ OTIMIZADO: Invalidar queries de alocações
          console.log('♻️ [Realtime Allocations] Invalidating allocations queries');
          
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
            console.log('♻️ [Realtime Allocations] Invalidated payroll cache for event:', eventId);
          }

          console.log('✅ [Realtime Allocations] Cache invalidated successfully');
        }
      )
      .subscribe((status) => {
        console.log('📡 [Realtime Allocations] Subscription status:', status);
      });

    return () => {
      console.log('🔌 [Realtime Allocations] Unsubscribing from allocations changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
