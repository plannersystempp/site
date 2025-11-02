import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlanChangeHistoryItem {
  id: string;
  created_at: string;
  action: string;
  user_name: string | null;
  user_email: string | null;
  old_values: {
    plan_name?: string;
    plan_display_name?: string;
    price?: number;
    status?: string;
  } | null;
  new_values: {
    plan_name?: string;
    plan_display_name?: string;
    price?: number;
    status?: string;
  } | null;
}

interface UsePlanChangeHistoryOptions {
  teamId: string;
  enabled?: boolean;
}

export function usePlanChangeHistory({ teamId, enabled = true }: UsePlanChangeHistoryOptions) {
  return useQuery({
    queryKey: ['plan-change-history', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          created_at,
          action,
          old_values,
          new_values,
          user_profiles!audit_logs_user_id_fkey(name, email)
        `)
        .eq('team_id', teamId)
        .in('action', ['UPDATE', 'SUBSCRIPTION_PLAN_CHANGED', 'INSERT'])
        .eq('table_name', 'team_subscriptions')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        action: item.action,
        user_name: item.user_profiles?.name || null,
        user_email: item.user_profiles?.email || null,
        old_values: item.old_values,
        new_values: item.new_values,
      })) as PlanChangeHistoryItem[];
    },
    enabled,
    staleTime: 30000,
  });
}
