import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { personnelKeys } from './usePersonnelQuery';
import type { Personnel } from '@/contexts/EnhancedDataContext';

/**
 * Remove caracteres não numéricos para comparar CPF/CNPJ
 */
const removeNonNumeric = (value: string | null | undefined): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

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
      .channel('schema-db-changes')
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
              
              // Verificar se já existe no cache (evitar duplicação)
              if (currentData.some(p => p.id === newPersonnel.id)) {
                console.log('[Realtime] Personnel already in cache, skipping:', newPersonnel.id);
                break;
              }
              
              // Remover placeholders temporários relacionados ao mesmo registro
              const cpfCleaned = removeNonNumeric(newPersonnel.cpf);
              const filteredData = currentData.filter(p => {
                // Manter registros reais
                if (!p.id.startsWith('temp-')) return true;
                
                // Remover temp- com mesmo CPF (se CPF existir)
                if (cpfCleaned && removeNonNumeric(p.cpf) === cpfCleaned) {
                  console.log('[Realtime] Removing temp placeholder by CPF:', p.id);
                  return false;
                }
                
                // Remover temp- com mesmo nome exato (fallback)
                if (p.name === newPersonnel.name) {
                  console.log('[Realtime] Removing temp placeholder by name:', p.id);
                  return false;
                }
                
                return true;
              });
              
              // Adicionar novo registro real
              const personnelToAdd: Personnel = {
                ...newPersonnel,
                functions: [],
                type: newPersonnel.type || 'freelancer',
              };
              
              queryClient.setQueryData<Personnel[]>(
                queryKey,
                [...filteredData, personnelToAdd]
              );
              console.log('[Realtime] Personnel added to cache:', newPersonnel.id);
              break;
            }

            case 'UPDATE': {
              const updatedPersonnel = payload.new as any;
              // Atualizar registro existente, preservando apenas functions do cache
              // primaryFunctionId vem do payload, não preservar do cache
              queryClient.setQueryData<Personnel[]>(
                queryKey,
                currentData.map(p => 
                  p.id === updatedPersonnel.id
                    ? {
                        ...updatedPersonnel,
                        functions: p.functions || [], // Preservar apenas functions (não vem no payload)
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

          // Realtime: update cache only; no background invalidation
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
