import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import { personnelPaymentsKeys } from './usePersonnelPaymentsQuery';

export const usePersonnelPaymentsRealtime = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam?.id) return;

    const channel = supabase
      .channel('personnel-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personnel_payments',
          filter: `team_id=eq.${activeTeam.id}`,
        },
        (payload) => {
          logger.realtime.change(payload.eventType as any, { id: (payload.new as any)?.id });
          
          // ⚡ FASE 2 OTIMIZADO: Invalidar queries em vez de setQueryData
          logger.cache.invalidate('personnelPaymentsKeys.all');
          
          queryClient.invalidateQueries({ 
            queryKey: personnelPaymentsKeys.all,
            refetchType: 'active' // Refetch queries ativas imediatamente
          });

          // Também invalidar queries inativas para próxima montagem
          queryClient.invalidateQueries({ 
            queryKey: personnelPaymentsKeys.all,
            refetchType: 'none' // Apenas marcar como stale sem refetch
          });
          

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
