import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { personnelKeys } from './usePersonnelQuery';
import type { Personnel } from '@/contexts/EnhancedDataContext';
import { logger } from '@/utils/logger';

/**
 * Remove caracteres não numéricos para comparar CPF/CNPJ
 */
const removeNonNumeric = (value: string | null | undefined): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Busca as funções de um personnel do banco de dados
 */
const fetchPersonnelFunctions = async (personnelId: string, teamId: string) => {
  const { data, error } = await supabase
    .from('personnel_functions')
    .select('function_id, is_primary, functions:function_id(id, name, description)')
    .eq('personnel_id', personnelId)
    .eq('team_id', teamId);

  if (error) {
    console.error('[Realtime] Error fetching functions:', error);
    return [];
  }

  return (data || [])
    .map(pf => pf.functions)
    .filter(f => f != null) as any[];
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

    logger.realtime.connected();

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
        async (payload) => {
          logger.realtime.change(payload.eventType, { id: (payload.new as any)?.id || (payload.old as any)?.id });

          const queryKey = personnelKeys.list(activeTeam.id);
          const currentData = queryClient.getQueryData<Personnel[]>(queryKey);

          if (!currentData) return;

          switch (payload.eventType) {
            case 'INSERT': {
              const newPersonnel = payload.new as any;
              
              // CORREÇÃO DEFINITIVA: Verificar se já existe no cache (evitar duplicação)
              const existingIndex = currentData.findIndex(p => p.id === newPersonnel.id);
              if (existingIndex !== -1) {
                console.log('[Realtime] Personnel already in cache, updating instead:', newPersonnel.id);
                // Buscar funções atualizadas e atualizar o registro existente
                const functions = await fetchPersonnelFunctions(newPersonnel.id, activeTeam.id);
                queryClient.setQueryData<Personnel[]>(
                  queryKey,
                  currentData.map(p => 
                    p.id === newPersonnel.id 
                      ? {
                          ...newPersonnel,
                          functions: functions,
                          type: newPersonnel.type || 'freelancer',
                        }
                      : p
                  )
                );
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
              
              // Buscar funções do banco de dados
              const functions = await fetchPersonnelFunctions(newPersonnel.id, activeTeam.id);
              
              // Adicionar novo registro real com funções
              const personnelToAdd: Personnel = {
                ...newPersonnel,
                functions: functions,
                type: newPersonnel.type || 'freelancer',
              };
              
              const finalData = [...filteredData, personnelToAdd];
              
              queryClient.setQueryData<Personnel[]>(
                queryKey,
                finalData
              );
              
              console.log('[Realtime] Personnel added to cache:', newPersonnel.id);
              console.log('[Realtime] Functions loaded:', functions.length);
              console.log('[Realtime] Final cache state:', finalData.length, 'records');
              
              break;
            }

            case 'UPDATE': {
              const updatedPersonnel = payload.new as any;
              
              // Buscar funções atualizadas do banco de dados
              const functions = await fetchPersonnelFunctions(updatedPersonnel.id, activeTeam.id);
              
              // Atualizar registro existente com funções atualizadas
              queryClient.setQueryData<Personnel[]>(
                queryKey,
                currentData.map(p => 
                  p.id === updatedPersonnel.id
                    ? {
                        ...updatedPersonnel,
                        functions: functions,
                        type: updatedPersonnel.type || 'freelancer',
                      }
                    : p
                )
              );
              console.log('[Realtime] Personnel updated in cache:', updatedPersonnel.id);
              console.log('[Realtime] Functions reloaded:', functions.length);
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
