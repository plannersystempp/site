import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
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
          console.log('🔄 [Personnel Payments Realtime]', payload.eventType, payload.new);
          
          // Invalidar E refazer as queries imediatamente
          queryClient.invalidateQueries({ 
            queryKey: personnelPaymentsKeys.all,
            refetchType: 'active' // Refetch queries ativas imediatamente
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
