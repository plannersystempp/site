import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import type { WorkRecord } from '@/contexts/EnhancedDataContext';

export const workLogsKeys = {
  all: ['workLogs'] as const,
  list: (teamId?: string) => ['workLogs', 'list', teamId] as const,
  byEvent: (eventId?: string) => ['workLogs', 'event', eventId] as const,
};

/**
 * Hook para sincronização em tempo real de lançamentos de horas
 * Atualiza folha de pagamento e dashboard automaticamente
 */
export const useWorkLogsRealtime = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam?.id) return;

    logger.realtime.connected();

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
          logger.realtime.change(payload.eventType, { id: (payload.new as any)?.id || (payload.old as any)?.id });

          const queryKey = workLogsKeys.list(activeTeam.id);
          const currentData = queryClient.getQueryData<WorkRecord[]>(queryKey);

          if (!currentData) return;

          switch (payload.eventType) {
            case 'INSERT': {
              const newWorkLog = payload.new as WorkRecord;
              
              // Verificar se já existe no cache
              const existingIndex = currentData.findIndex(w => w.id === newWorkLog.id);
              if (existingIndex !== -1) {
                console.log('[Realtime WorkLogs] WorkLog already in cache, updating instead:', newWorkLog.id);
                queryClient.setQueryData<WorkRecord[]>(
                  queryKey,
                  currentData.map(w => w.id === newWorkLog.id ? newWorkLog : w)
                );
                break;
              }
              
              // Adicionar novo log
              queryClient.setQueryData<WorkRecord[]>(
                queryKey,
                [...currentData, newWorkLog]
              );
              
              console.log('[Realtime WorkLogs] WorkLog added to cache:', newWorkLog.id);
              break;
            }

            case 'UPDATE': {
              const updatedWorkLog = payload.new as WorkRecord;
              
              queryClient.setQueryData<WorkRecord[]>(
                queryKey,
                currentData.map(w => 
                  w.id === updatedWorkLog.id ? updatedWorkLog : w
                )
              );
              console.log('[Realtime WorkLogs] WorkLog updated in cache:', updatedWorkLog.id);
              break;
            }

            case 'DELETE': {
              const deletedId = payload.old.id;
              
              queryClient.setQueryData<WorkRecord[]>(
                queryKey,
                currentData.filter(w => w.id !== deletedId)
              );
              console.log('[Realtime WorkLogs] WorkLog removed from cache:', deletedId);
              break;
            }
          }

          // Invalidar cache de payroll relacionado ao evento
          const eventId = (payload.new as any)?.event_id || (payload.old as any)?.event_id;
          if (eventId) {
            queryClient.invalidateQueries({ queryKey: ['payroll', 'event', eventId] });
            console.log('[Realtime WorkLogs] Invalidated payroll cache for event:', eventId);
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime WorkLogs] Subscription status:', status);
      });

    return () => {
      console.log('[Realtime WorkLogs] Unsubscribing from work logs changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
