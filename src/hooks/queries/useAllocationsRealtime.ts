import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import type { Assignment } from '@/contexts/EnhancedDataContext';

export const allocationsKeys = {
  all: ['allocations'] as const,
  list: (teamId?: string) => ['allocations', 'list', teamId] as const,
  byEvent: (eventId?: string) => ['allocations', 'event', eventId] as const,
};

/**
 * Hook para sincronização em tempo real de alocações de pessoal
 * CRÍTICO: Evita conflitos de edição simultânea e sincroniza folha de pagamento
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
          logger.realtime.change(payload.eventType, { id: (payload.new as any)?.id || (payload.old as any)?.id });

          const queryKey = allocationsKeys.list(activeTeam.id);
          const currentData = queryClient.getQueryData<Assignment[]>(queryKey);

          if (!currentData) return;

          switch (payload.eventType) {
            case 'INSERT': {
              const newAllocation = payload.new as Assignment;
              
              // Verificar se já existe no cache
              const existingIndex = currentData.findIndex(a => a.id === newAllocation.id);
              if (existingIndex !== -1) {
                console.log('[Realtime Allocations] Allocation already in cache, updating instead:', newAllocation.id);
                queryClient.setQueryData<Assignment[]>(
                  queryKey,
                  currentData.map(a => a.id === newAllocation.id ? newAllocation : a)
                );
                break;
              }
              
              // Adicionar nova alocação
              queryClient.setQueryData<Assignment[]>(
                queryKey,
                [...currentData, newAllocation]
              );
              
              console.log('[Realtime Allocations] Allocation added to cache:', newAllocation.id);
              break;
            }

            case 'UPDATE': {
              const updatedAllocation = payload.new as Assignment;
              
              queryClient.setQueryData<Assignment[]>(
                queryKey,
                currentData.map(a => 
                  a.id === updatedAllocation.id ? updatedAllocation : a
                )
              );
              console.log('[Realtime Allocations] Allocation updated in cache:', updatedAllocation.id);
              break;
            }

            case 'DELETE': {
              const deletedId = payload.old.id;
              
              queryClient.setQueryData<Assignment[]>(
                queryKey,
                currentData.filter(a => a.id !== deletedId)
              );
              console.log('[Realtime Allocations] Allocation removed from cache:', deletedId);
              break;
            }
          }

          // Invalidar cache de payroll relacionado ao evento
          const eventId = (payload.new as any)?.event_id || (payload.old as any)?.event_id;
          if (eventId) {
            queryClient.invalidateQueries({ queryKey: ['payroll', 'event', eventId] });
            console.log('[Realtime Allocations] Invalidated payroll cache for event:', eventId);
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime Allocations] Subscription status:', status);
      });

    return () => {
      console.log('[Realtime Allocations] Unsubscribing from allocations changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
