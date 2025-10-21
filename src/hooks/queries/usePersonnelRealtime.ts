import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { personnelKeys } from './usePersonnelQuery';
import type { Personnel } from '@/contexts/EnhancedDataContext';

/**
 * Hook para sincronização em tempo real de dados de pessoal
 * Atualiza o cache do React Query quando houver mudanças no banco
 */
export const usePersonnelRealtime = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam?.id) return;

    console.log('[Realtime] Subscribing to personnel changes for team:', activeTeam.id);

    const channel = supabase
      .channel('personnel-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personnel',
          filter: `team_id=eq.${activeTeam.id}`
        },
        (payload) => {
          console.log('[Realtime] Personnel change detected:', payload.eventType, payload);

          const queryKey = personnelKeys.list(activeTeam.id);
          const currentData = queryClient.getQueryData<Personnel[]>(queryKey);

          if (!currentData) return;

          switch (payload.eventType) {
            case 'INSERT': {
              const newPersonnel = payload.new as any;
              // Adicionar novo registro, preservando o shape esperado
              const personnelToAdd: Personnel = {
                ...newPersonnel,
                functions: [],
                type: newPersonnel.type || 'freelancer',
              };
              
              queryClient.setQueryData<Personnel[]>(
                queryKey,
                [...currentData, personnelToAdd]
              );
              console.log('[Realtime] Personnel added to cache:', newPersonnel.id);
              break;
            }

            case 'UPDATE': {
              const updatedPersonnel = payload.new as any;
              // Atualizar registro existente, preservando functions do cache
              queryClient.setQueryData<Personnel[]>(
                queryKey,
                currentData.map(p => 
                  p.id === updatedPersonnel.id
                    ? {
                        ...updatedPersonnel,
                        functions: p.functions || [],
                        primaryFunctionId: p.primaryFunctionId,
                        type: updatedPersonnel.type || 'freelancer',
                      }
                    : p
                )
              );
              console.log('[Realtime] Personnel updated in cache:', updatedPersonnel.id);
              break;
            }

            case 'DELETE': {
              const deletedId = payload.old.id;
              // Remover do cache
              queryClient.setQueryData<Personnel[]>(
                queryKey,
                currentData.filter(p => p.id !== deletedId)
              );
              console.log('[Realtime] Personnel removed from cache:', deletedId);
              break;
            }
          }

          // Disparar refetch em background para consolidar (sem afetar UI)
          setTimeout(() => {
            queryClient.invalidateQueries({ 
              queryKey,
              refetchType: 'none' // Não refetch imediato, apenas invalida
            });
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Unsubscribing from personnel changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
