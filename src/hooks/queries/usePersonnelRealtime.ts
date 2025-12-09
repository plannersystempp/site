import { useEffect, useRef } from 'react';
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
    logger.query.error('personnelFunctions', error);
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
  const lastStatusRef = useRef<string>('');
  const fallbackIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeTeam?.id) return;

    logger.realtime.connected();

    const channel = supabase
      .channel(`realtime-personnel-${activeTeam.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personnel'
        },
        async (payload) => {
          const personnelId = (payload.new as any)?.id || (payload.old as any)?.id;
          const newTeamId = (payload.new as any)?.team_id;
          const oldTeamId = (payload.old as any)?.team_id;
          const matchesTeam = newTeamId === activeTeam.id || oldTeamId === activeTeam.id;
          if (!matchesTeam) return;
          
          
          logger.realtime.change(payload.eventType, { id: personnelId });

          // ⚡ OTIMIZADO: Invalidar queries em vez de manipular cache manualmente
          // Isso garante dados sempre frescos e evita problemas de sincronização
          logger.cache.invalidate('personnelKeys.all');
          
          queryClient.invalidateQueries({ 
            queryKey: personnelKeys.all,
            refetchType: 'active' // Refetch queries ativas imediatamente
          });

          // Também invalidar queries inativas para próxima montagem
          queryClient.invalidateQueries({ 
            queryKey: personnelKeys.all,
            refetchType: 'none' // Apenas marcar como stale sem refetch
          });

        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.realtime.info('SUBSCRIBED');
          lastStatusRef.current = status;
          if (fallbackIntervalRef.current) {
            clearInterval(fallbackIntervalRef.current);
            fallbackIntervalRef.current = null;
          }
        } else if (status === 'CHANNEL_ERROR') {
          logger.realtime.error('CHANNEL_ERROR');
          lastStatusRef.current = status;
        } else if (status === 'TIMED_OUT') {
          logger.realtime.error('TIMED_OUT');
          lastStatusRef.current = status;
        } else if (status === 'CLOSED') {
          lastStatusRef.current = status;
        }
      });

    const functionsChannel = supabase
      .channel(`realtime-personnel-functions-${activeTeam.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personnel_functions',
          filter: `team_id=eq.${activeTeam.id}`
        },
        async () => {
          queryClient.invalidateQueries({ queryKey: personnelKeys.all, refetchType: 'active' });
          queryClient.invalidateQueries({ queryKey: personnelKeys.all, refetchType: 'none' });
        }
      )
      .subscribe();

    if (!fallbackIntervalRef.current) {
      fallbackIntervalRef.current = window.setInterval(() => {
        if (lastStatusRef.current && lastStatusRef.current !== 'SUBSCRIBED') {
          queryClient.invalidateQueries({ queryKey: personnelKeys.all, refetchType: 'active' });
        }
      }, 15000);
    }

    return () => {
      logger.realtime.debug('UNSUBSCRIBE');
      supabase.removeChannel(channel);
      supabase.removeChannel(functionsChannel);
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };
  }, [activeTeam?.id, queryClient]);
};
