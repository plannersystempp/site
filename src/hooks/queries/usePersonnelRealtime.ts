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
 * FASE 2: Sistema Realtime Otimizado com Invalidação
 * Hook para sincronização em tempo real de dados de pessoal
 * ✅ Usa invalidateQueries para garantir atualização consistente
 */
export const usePersonnelRealtime = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam?.id) return;

    logger.realtime.connected();
    console.log('🔌 [Realtime Personnel] Connecting for team:', activeTeam.id);

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
          const personnelId = (payload.new as any)?.id || (payload.old as any)?.id;
          
          console.log('🔄 [Realtime Personnel] Change detected:', {
            type: payload.eventType,
            personnelId,
            timestamp: new Date().toISOString(),
          });
          
          logger.realtime.change(payload.eventType, { id: personnelId });

          // ⚡ OTIMIZADO: Invalidar queries em vez de manipular cache manualmente
          // Isso garante dados sempre frescos e evita problemas de sincronização
          console.log('♻️ [Realtime Personnel] Invalidating personnel queries');
          
          queryClient.invalidateQueries({ 
            queryKey: personnelKeys.all,
            refetchType: 'active' // Refetch queries ativas imediatamente
          });

          // Também invalidar queries inativas para próxima montagem
          queryClient.invalidateQueries({ 
            queryKey: personnelKeys.all,
            refetchType: 'none' // Apenas marcar como stale sem refetch
          });

          console.log('✅ [Realtime Personnel] Cache invalidated successfully');
        }
      )
      .subscribe((status) => {
        console.log('📡 [Realtime Personnel] Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          logger.realtime.info('✅ [Realtime Personnel] Successfully subscribed');
        } else if (status === 'CHANNEL_ERROR') {
          logger.realtime.error('❌ [Realtime Personnel] Channel error');
        } else if (status === 'TIMED_OUT') {
          logger.realtime.error('⏱️ [Realtime Personnel] Subscription timed out');
        }
      });

    return () => {
      console.log('🔌 [Realtime Personnel] Unsubscribing from personnel changes');
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
