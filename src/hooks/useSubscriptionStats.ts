import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  expired_subscriptions: number;
  past_due_subscriptions: number;
  mrr: number; // Monthly Recurring Revenue
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async (): Promise<SubscriptionStats> => {
      // Buscar todas as assinaturas com seus planos
      const { data: subscriptions, error } = await supabase
        .from('team_subscriptions')
        .select(`
          status,
          subscription_plans!inner(price)
        `);

      if (error) throw error;

      // Calcular estatísticas
      const stats = subscriptions.reduce(
        (acc, sub) => {
          acc.total_subscriptions++;
          
          if (sub.status === 'active') {
            acc.active_subscriptions++;
            acc.mrr += Number((sub.subscription_plans as any).price || 0);
          } else if (sub.status === 'trial') {
            acc.trial_subscriptions++;
          } else if (sub.status === 'trial_expired') {
            acc.expired_subscriptions++;
          } else if (sub.status === 'past_due') {
            acc.past_due_subscriptions++;
          }
          
          return acc;
        },
        {
          total_subscriptions: 0,
          active_subscriptions: 0,
          trial_subscriptions: 0,
          expired_subscriptions: 0,
          past_due_subscriptions: 0,
          mrr: 0
        } as SubscriptionStats
      );

      return stats;
    },
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });
}
