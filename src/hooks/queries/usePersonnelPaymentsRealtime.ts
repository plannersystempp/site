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
        () => {
          // Invalidar todas as queries relacionadas
          queryClient.invalidateQueries({ 
            queryKey: personnelPaymentsKeys.byTeam(activeTeam.id) 
          });
          queryClient.invalidateQueries({ 
            queryKey: personnelPaymentsKeys.stats(activeTeam.id) 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};
