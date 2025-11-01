import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  user_growth: Array<{ date: string; count: number }>;
  mrr_history: Array<{ month: string; mrr: number }>;
  top_teams: Array<{
    team_id: string;
    team_name: string;
    event_count: number;
    member_count: number;
  }>;
  stats: {
    total_users: number;
    active_users: number;
    total_teams: number;
    active_subscriptions: number;
    trial_subscriptions: number;
    total_events: number;
    total_personnel: number;
    current_mrr: number;
    trial_conversion_rate: number;
    expiring_trials_7d: number;
    orphan_users: number;
    unassigned_errors: number;
  };
}

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: ['superadmin-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data, error } = await supabase.rpc('get_superadmin_dashboard_stats');
      
      if (error) throw error;
      if (!data) throw new Error('Nenhum dado retornado');
      
      return data as unknown as DashboardStats;
    },
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });
}
