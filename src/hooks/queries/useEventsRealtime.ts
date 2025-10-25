import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import type { Event } from '@/contexts/EnhancedDataContext';
import { eventKeys } from './useEventsQuery';

/**
 * Hook para sincronização em tempo real de eventos
 * Atualiza o cache do React Query quando houver mudanças no banco
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
          logger.realtime.change(payload.eventType, { id: (payload.new as any)?.id || (payload.old as any)?.id });

          const queryKey = eventKeys.list(activeTeam.id);
          const currentData = queryClient.getQueryData<Event[]>(queryKey);

          if (!currentData) return;

          switch (payload.eventType) {
            case 'INSERT': {
              const newEvent = payload.new as Event;
              
              // Verificar se já existe no cache (evitar duplicação)
              const existingIndex = currentData.findIndex(e => e.id === newEvent.id);
              if (existingIndex !== -1) {
                console.log('[Realtime Events] Event already in cache, updating instead:', newEvent.id);
                queryClient.setQueryData<Event[]>(
                  queryKey,
                  currentData.map(e => e.id === newEvent.id ? newEvent : e)
                );
                break;
              }
              
              // Adicionar novo evento
              queryClient.setQueryData<Event[]>(
                queryKey,
                [...currentData, newEvent]
              );
              
              console.log('[Realtime Events] Event added to cache:', newEvent.id);
              break;
            }

            case 'UPDATE': {
              const updatedEvent = payload.new as Event;
              
              queryClient.setQueryData<Event[]>(
                queryKey,
                currentData.map(e => 
                  e.id === updatedEvent.id ? updatedEvent : e
                )
              );
              console.log('[Realtime Events] Event updated in cache:', updatedEvent.id);
              break;
            }

            case 'DELETE': {
              const deletedId = payload.old.id;
              
              queryClient.setQueryData<Event[]>(
                queryKey,
                currentData.filter(e => e.id !== deletedId)
              );
              console.log('[Realtime Events] Event removed from cache:', deletedId);
              break;
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime Events] Subscription status:', status);
      });

    return () => {
      console.log('[Realtime Events] Unsubscribing from events changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
