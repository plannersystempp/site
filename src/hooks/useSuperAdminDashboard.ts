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
      
      if (error) {
        console.error('[SuperAdmin] Erro ao buscar stats:', error);
        throw new Error(`Falha ao buscar estatísticas: ${error.message}`);
      }
      
      if (!data) {
        console.warn('[SuperAdmin] Nenhum dado retornado');
        throw new Error('Nenhum dado retornado pela função RPC');
      }

      // Validação e normalização dos dados
      const rawData = data as any; // Type assertion para trabalhar com dados dinâmicos
      const normalizedData: DashboardStats = {
        user_growth: Array.isArray(rawData.user_growth) ? rawData.user_growth : [],
        mrr_history: Array.isArray(rawData.mrr_history) ? rawData.mrr_history : [],
        top_teams: Array.isArray(rawData.top_teams) ? rawData.top_teams : [],
        stats: {
          total_users: rawData.stats?.total_users ?? 0,
          active_users: rawData.stats?.active_users ?? 0,
          total_teams: rawData.stats?.total_teams ?? 0,
          active_subscriptions: rawData.stats?.active_subscriptions ?? 0,
          trial_subscriptions: rawData.stats?.trial_subscriptions ?? 0,
          total_events: rawData.stats?.total_events ?? 0,
          total_personnel: rawData.stats?.total_personnel ?? 0,
          current_mrr: rawData.stats?.current_mrr ?? 0,
          trial_conversion_rate: rawData.stats?.trial_conversion_rate ?? 0,
          expiring_trials_7d: rawData.stats?.expiring_trials_7d ?? 0,
          orphan_users: rawData.stats?.orphan_users ?? 0,
          unassigned_errors: rawData.stats?.unassigned_errors ?? 0,
        }
      };

      console.info('[SuperAdmin] Stats carregadas:', {
        users: normalizedData.stats.total_users,
        teams: normalizedData.stats.total_teams,
        events: normalizedData.stats.total_events
      });

      return normalizedData;
    },
    refetchInterval: 30000,
    staleTime: 30000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
