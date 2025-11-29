import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { logger } from '@/utils/logger';
import { absenceKeys } from './useAbsencesQuery';
import { payrollKeys } from './usePayrollQuery';

export const useAbsencesRealtime = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam?.id) return;

    logger.realtime.connected();

    const channel = supabase
      .channel('absences-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'absences',
          filter: `team_id=eq.${activeTeam.id}`
        },
        async (payload) => {
          logger.realtime.change(payload.eventType, { id: (payload.new as any)?.id || (payload.old as any)?.id });

          queryClient.invalidateQueries({ queryKey: absenceKeys.all });

          const assignmentId = (payload.new as any)?.assignment_id || (payload.old as any)?.assignment_id;
          if (assignmentId) {
            const { data: allocation } = await supabase
              .from('personnel_allocations')
              .select('event_id')
              .eq('id', assignmentId)
              .single();

            const eventId = allocation?.event_id;
            if (eventId) {
              queryClient.invalidateQueries({ queryKey: payrollKeys.event(eventId) });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTeam?.id, queryClient]);
};