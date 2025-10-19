import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
  id: string;
  team_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'trial_expired';
  trial_ends_at: string | null;
  current_period_starts_at: string;
  current_period_ends_at: string;
  canceled_at: string | null;
  created_at: string;
  teams: {
    name: string;
    cnpj: string | null;
    is_system?: boolean;
  };
  subscription_plans: {
    display_name: string;
    price: number;
    billing_cycle: string;
  };
}

interface UseSubscriptionsOptions {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useSubscriptions(options: UseSubscriptionsOptions = {}) {
  const { status = 'all', search = '', page = 1, pageSize = 10 } = options;
  
  return useQuery({
    queryKey: ['subscriptions', status, search, page, pageSize],
    queryFn: async (): Promise<{ data: Subscription[]; total: number }> => {
      let query = supabase
        .from('team_subscriptions')
        .select(`
          *,
          teams!inner(name, cnpj, is_system),
          subscription_plans!inner(display_name, price, billing_cycle)
        `, { count: 'exact' })
        .eq('teams.is_system', false)
        .order('created_at', { ascending: false });

      // Filtro de status
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Filtro de busca por nome da equipe
      if (search) {
        query = query.ilike('teams.name', `%${search}%`);
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fallback: filtrar em memória caso o filtro nested não funcione
      const filteredData = (data as Subscription[]).filter(
        sub => !sub.teams?.is_system
      );

      return {
        data: filteredData,
        total: count || 0
      };
    },
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });
}
