import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import type { Division } from '@/contexts/EnhancedDataContext';

export const divisionsKeys = {
  all: ['divisions'] as const,
  list: (teamId?: string) => ['divisions', 'list', teamId] as const,
  byEvent: (eventId?: string) => ['divisions', 'event', eventId] as const,
};

/**
 * Hook para sincronização em tempo real de divisões de eventos
 * Sincroniza lista de divisões em formulários e cards automaticamente
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
          logger.realtime.change(payload.eventType, { id: (payload.new as any)?.id || (payload.old as any)?.id });

          const queryKey = divisionsKeys.list(activeTeam.id);
          const currentData = queryClient.getQueryData<Division[]>(queryKey);

          if (!currentData) return;

          switch (payload.eventType) {
            case 'INSERT': {
              const newDivision = payload.new as Division;
              
              // Verificar se já existe no cache
              const existingIndex = currentData.findIndex(d => d.id === newDivision.id);
              if (existingIndex !== -1) {
                console.log('[Realtime Divisions] Division already in cache, updating instead:', newDivision.id);
                queryClient.setQueryData<Division[]>(
                  queryKey,
                  currentData.map(d => d.id === newDivision.id ? newDivision : d)
                );
                break;
              }
              
              // Adicionar nova divisão
              queryClient.setQueryData<Division[]>(
                queryKey,
                [...currentData, newDivision]
              );
              
              console.log('[Realtime Divisions] Division added to cache:', newDivision.id);
              break;
            }

            case 'UPDATE': {
              const updatedDivision = payload.new as Division;
              
              queryClient.setQueryData<Division[]>(
                queryKey,
                currentData.map(d => 
                  d.id === updatedDivision.id ? updatedDivision : d
                )
              );
              console.log('[Realtime Divisions] Division updated in cache:', updatedDivision.id);
              break;
            }

            case 'DELETE': {
              const deletedId = payload.old.id;
              
              queryClient.setQueryData<Division[]>(
                queryKey,
                currentData.filter(d => d.id !== deletedId)
              );
              console.log('[Realtime Divisions] Division removed from cache:', deletedId);
              break;
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime Divisions] Subscription status:', status);
      });

    return () => {
      console.log('[Realtime Divisions] Unsubscribing from divisions changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
