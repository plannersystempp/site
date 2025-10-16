import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LimitCheckResult {
  can_proceed: boolean;
  reason: string;
  requires_upgrade: boolean;
  current_plan?: string;
  current_count?: number;
  limit?: number;
  usage_percentage?: number;
}

export function useCheckSubscriptionLimits() {
  return useMutation({
    mutationFn: async ({ 
      teamId, 
      action 
    }: { 
      teamId: string; 
      action: 'add_member' | 'create_event' | 'add_personnel' 
    }): Promise<LimitCheckResult> => {
      const { data, error } = await supabase
        .rpc('check_subscription_limits', {
          p_team_id: teamId,
          p_action: action
        });

      if (error) throw error;
      if (!data) throw new Error('Nenhum dado retornado');

      return data as unknown as LimitCheckResult;
    }
  });
}
