import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { parseDateSafe } from '@/utils/dateUtils';

interface SubscriptionStatus {
  isActive: boolean;
  status: string;
  planName: string;
  expiresAt: string | null;
  daysUntilExpiration?: number;
  isLifetime?: boolean;
}

export function useSubscriptionGuard(teamId: string | undefined) {
  const navigate = useNavigate();

  // Check if user is superadmin - they bypass all subscription checks
  const { data: isSuperAdmin } = useQuery({
    queryKey: ['is-superadmin'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (error) throw error;
      return data as boolean;
    }
  });

  // SuperAdmin bypass - they have full access
  if (isSuperAdmin) {
    return {
      subscription: null,
      isLoading: false,
      canProceed: true,
      isActive: true
    };
  }

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['team-subscription', teamId],
    queryFn: async (): Promise<SubscriptionStatus | null> => {
      if (!teamId) return null;

      const { data, error } = await supabase
        .from('team_subscriptions')
        .select(`
          status,
          current_period_ends_at,
          trial_ends_at,
          plan_id,
          subscription_plans(display_name, billing_cycle)
        `)
        .eq('team_id', teamId)
        .single();

      if (error) {
        console.error('Erro ao buscar assinatura:', error);
        throw error;
      }

      // Confiar no status do banco - não sobrescrever
      const isActive = ['active', 'trial'].includes(data.status);
      const expiresAt = data.trial_ends_at || data.current_period_ends_at;
      const billingCycle = (data.subscription_plans as any)?.billing_cycle;
      let planName = (data.subscription_plans as any)?.display_name;
      const cycle = (data.subscription_plans as any)?.billing_cycle;
      if (!planName && cycle === 'lifetime') planName = 'Plano Vitalício';
      if (!planName && data.plan_id) {
        const { data: planRow } = await supabase
          .from('subscription_plans')
          .select('display_name, billing_cycle')
          .eq('id', data.plan_id)
          .single();
        planName = planRow?.display_name || (planRow?.billing_cycle === 'lifetime' ? 'Plano Vitalício' : undefined);
      }
      if (!planName) planName = 'Free';

      const isLifetime = billingCycle === 'lifetime' || data.status === 'free' || planName === 'Free' || planName === 'Plano Vitalício';

      let daysUntilExpiration = undefined;
      if (!isLifetime && expiresAt) {
        const expirationDate = parseDateSafe(expiresAt);
        if (!isNaN(expirationDate.getTime())) {
          const now = new Date();
          daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          console.error('⚠️ [useSubscriptionGuard] Data de expiração inválida:', expiresAt);
        }
      }

      return {
        isActive,
        status: data.status,
        planName,
        expiresAt,
        daysUntilExpiration,
        isLifetime
      };
    },
    enabled: !!teamId,
    refetchInterval: 60000, // Revalidar a cada 1 minuto
    retry: 2
  });

  useEffect(() => {
    if (!isLoading && subscription) {
      // APENAS redirecionar se status do BANCO for expired/canceled/past_due
      const inactiveStatuses = ['expired', 'canceled', 'past_due', 'trial_expired'];
      
      if (inactiveStatuses.includes(subscription.status)) {
        toast({
          title: 'Assinatura Inativa',
          description: 'Sua assinatura expirou. Renove para continuar usando o PlannerSystem.',
          variant: 'destructive',
          duration: 5000
        });
        
        setTimeout(() => {
          navigate('/plans');
        }, 3000);
      }
      // Avisar se estiver próximo da expiração (últimos 7 dias)
      // Avisar se estiver próximo da expiração (últimos 7 dias) - NUNCA para planos vitalícios
      else if (!subscription.isLifetime && subscription.daysUntilExpiration && subscription.daysUntilExpiration <= 7 && subscription.daysUntilExpiration > 0) {
        toast({
          title: 'Assinatura Expirando em Breve',
          description: `Sua assinatura ${subscription.planName} expira em ${subscription.daysUntilExpiration} dia(s).`,
          variant: 'default',
          duration: 7000
        });
      }
    }
  }, [subscription, isLoading, navigate]);

  return {
    subscription,
    isLoading,
    canProceed: subscription?.isActive || false,
    isActive: subscription?.isActive || false
  };
}
