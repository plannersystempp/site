import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import type { Func } from '@/contexts/EnhancedDataContext';

export const functionsRealtimeKeys = {
  all: ['functions'] as const,
  list: (teamId?: string) => ['functions', 'list', teamId] as const,
};

/**
 * Hook para sincronização em tempo real de funções
 * Sincroniza formulários automaticamente quando funções são criadas/editadas
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
          logger.realtime.change(payload.eventType, { id: (payload.new as any)?.id || (payload.old as any)?.id });

          const queryKey = functionsRealtimeKeys.list(activeTeam.id);
          const currentData = queryClient.getQueryData<Func[]>(queryKey);

          if (!currentData) return;

          switch (payload.eventType) {
            case 'INSERT': {
              const newFunction = payload.new as Func;
              
              // Verificar se já existe no cache
              const existingIndex = currentData.findIndex(f => f.id === newFunction.id);
              if (existingIndex !== -1) {
                console.log('[Realtime Functions] Function already in cache, updating instead:', newFunction.id);
                queryClient.setQueryData<Func[]>(
                  queryKey,
                  currentData.map(f => f.id === newFunction.id ? newFunction : f)
                );
                break;
              }
              
              // Adicionar nova função
              queryClient.setQueryData<Func[]>(
                queryKey,
                [...currentData, newFunction]
              );
              
              console.log('[Realtime Functions] Function added to cache:', newFunction.id);
              break;
            }

            case 'UPDATE': {
              const updatedFunction = payload.new as Func;
              
              queryClient.setQueryData<Func[]>(
                queryKey,
                currentData.map(f => 
                  f.id === updatedFunction.id ? updatedFunction : f
                )
              );
              console.log('[Realtime Functions] Function updated in cache:', updatedFunction.id);
              break;
            }

            case 'DELETE': {
              const deletedId = payload.old.id;
              
              queryClient.setQueryData<Func[]>(
                queryKey,
                currentData.filter(f => f.id !== deletedId)
              );
              console.log('[Realtime Functions] Function removed from cache:', deletedId);
              break;
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime Functions] Subscription status:', status);
      });

    return () => {
      console.log('[Realtime Functions] Unsubscribing from functions changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
